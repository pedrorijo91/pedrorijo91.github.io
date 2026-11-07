---
layout: post

title: 'Type-safe scoped queries in Go with GORM'
date: 2026-11-07 12:00:00
description: 'How to enforce tenant isolation at the repository layer using GORM scoped queries'

tags: [go, gorm, development practices]
---

Most modern web applications have users. Many of them also have some sort of grouping like companies or organizations. And now you start having a big concern: how do you ensure you're not exposing other users' data?

This was a problem I saw happening multiple times in my career. Especially when you have more junior developers on the team, or AI agents writing code, it's very easy to forget about adding the check in a given query.

The typical approach is to add a `WHERE organization_id = ?` to each query and rely on code reviews to catch any omissions. But code reviews are fallible, and a missed filter in a single query can expose sensitive data. What if we could make it structurally impossible to forget?

In this post I will walk through a pattern I have been using with [GORM](https://gorm.io/) that enforces tenant scoping at the type level, so the compiler and your linter do the checking instead of relying on human reviewers.

### The usual layered architecture

Most Go web applications follow a familiar structure:

- **Handler layer** — parses the HTTP request, extracts the authenticated user, calls the service layer, and writes the response.
- **Service layer** — orchestrates business logic, calls one or more repositories.
- **Repository layer** — talks to the database through GORM.

A naive repository might look like this:

```go
type ProjectRepository struct {
    db *gorm.DB
}

func (r *ProjectRepository) GetProject(projectID string) (*Project, error) {
    var project Project
    err := r.db.Where("id = ?", projectID).First(&project).Error
    return &project, err
}
```

The problem is clear: nothing stops a user from fetching a project that belongs to a different organization. The developer has to remember to add the scope every single time:

```go
func (r *ProjectRepository) GetProject(orgID, projectID string) (*Project, error) {
    var project Project
    err := r.db.Where("id = ? AND organization_id = ?", projectID, orgID).First(&project).Error
    return &project, err
}
```

This works, but it relies on discipline. Every new query, every new repository method, every new developer on the team must remember the rule. And if someone forgets, the bug is silent: the query succeeds, it just returns data it should not. Until you end up on the Hacker News front page.

### The scoped QueryClient pattern

Instead of exposing `*gorm.DB` directly, we introduce a `QueryClient` that pre-applies the tenant scope. Repository methods never receive a raw `*gorm.DB` — they receive a `QueryClient` that already knows which organization it belongs to.

```go
type QueryClient struct {
    db    *gorm.DB
    orgID string
}

func NewQueryClient(db *gorm.DB, orgID string) *QueryClient {
    scopedDB := db.Where("organization_id = ?", orgID)
    return &QueryClient{
        db:    scopedDB,
        orgID: orgID,
    }
}

func (qc *QueryClient) DB() *gorm.DB {
    return qc.db
}

func (qc *QueryClient) OrgID() string {
    return qc.orgID
}
```

Now every repository method takes a `*QueryClient` instead of a raw `*gorm.DB`:

```go
type ProjectRepository struct{}

func (r *ProjectRepository) GetProject(qc *QueryClient, projectID string) (*Project, error) {
    var project Project
    err := qc.DB().Where("id = ?", projectID).First(&project).Error
    return &project, err
}

func (r *ProjectRepository) ListProjects(qc *QueryClient) ([]Project, error) {
    var projects []Project
    err := qc.DB().Find(&projects).Error
    return projects, err
}
```

The generated SQL for `ListProjects` will automatically include `WHERE organization_id = ?` because the scope was applied when the `QueryClient` was created. Developers writing repository methods do not need to think about it.

### Wiring it through the layers

The handler layer is where we know who the user is, so that is where the `QueryClient` is created:

```go
func (h *ProjectHandler) GetProject(w http.ResponseWriter, r *http.Request) {
    user := auth.UserFromContext(r.Context()) // extracted from JWT or session
    projectID := chi.URLParam(r, "projectID")

    qc := NewQueryClient(h.db, user.OrganizationID)
    project, err := h.projectService.GetProject(qc, projectID)
    // ...
}
```

The service layer passes the `QueryClient` along:

```go
type ProjectService struct {
    projectRepo *ProjectRepository
    auditRepo   *AuditRepository
}

func (s *ProjectService) GetProject(qc *QueryClient, projectID string) (*Project, error) {
    return s.projectRepo.GetProject(qc, projectID)
}
```

At no point does any layer have access to an unscoped `*gorm.DB` for tenant data. The only place that creates a `QueryClient` is the handler, right after authentication, making it easy to audit.

### Transactions

GORM transactions give you a new `*gorm.DB` instance, so the scoped `QueryClient` integrates naturally:

```go
func (qc *QueryClient) Transaction(fn func(txQC *QueryClient) error) error {
    return qc.db.Transaction(func(tx *gorm.DB) error {
        txQC := &QueryClient{
            db:    tx.Where("organization_id = ?", qc.orgID),
            orgID: qc.orgID,
        }
        return fn(txQC)
    })
}
```

Service-layer code that needs a transaction still never touches a raw `*gorm.DB`:

```go
func (s *ProjectService) CreateProject(qc *QueryClient, req CreateProjectRequest) error {
    return qc.Transaction(func(txQC *QueryClient) error {
        project := &Project{
            ID:             uuid.New().String(),
            OrganizationID: txQC.OrgID(),
            // ...
        }
        if err := s.projectRepo.Create(txQC, project); err != nil {
            return err
        }
        return s.auditRepo.LogEvent(txQC, "project_created", project.ID)
    })
}
```

### Enforcing the pattern with a linter

The pattern already gives us structural safety. And even though it would be hard for a developer to miss the existing pattern, we can go further. A simple linter rule or a [go-vet analyzer](https://pkg.go.dev/golang.org/x/tools/go/analysis) can flag any repository method that accepts `*gorm.DB` instead of `*QueryClient`. This turns a convention into a compile-time (or CI-time) check.

A minimal approach: use `grep` or `ast` inspection to ensure that no exported function in your `repository` package has a `*gorm.DB` parameter. If your team uses [revive](https://github.com/mgechev/revive) or [golangci-lint](https://golangci-lint.run/), a custom rule can enforce this in CI.

### When you need unscoped access

There are legitimate cases where you need unscoped queries: admin dashboards, background jobs that process data across organizations, or migrations. For those, you can provide a separate, clearly-named constructor:

```go
func NewUnscopedClient(db *gorm.DB) *UnscopedClient {
    return &UnscopedClient{db: db}
}
```

By using a different type (`*UnscopedClient`), repository methods that require tenant scoping cannot accidentally receive an unscoped client. If a method signature expects `*QueryClient`, passing an `*UnscopedClient` is a compile error. This makes the unscoped path explicit and auditable.

### Conclusion

The core idea is simple: make the correct thing easy and the wrong thing impossible (or at least very hard). By replacing raw `*gorm.DB` access with a scoped `QueryClient`:

- Every query is scoped by default: no more relying on pure discipline.
- The compiler prevents passing the wrong type.
- A linter or package boundary prevents bypassing the pattern.
- Unscoped access is explicit and easy to audit.

While nowadays we can try to enforce these rules through AI-assisted code reviews, type safety and linter checks are more deterministic and reliable. They do not depend on the reviewer's attention or the AI model's context window. When it comes to data isolation, deterministic guarantees beat best-effort checks.
