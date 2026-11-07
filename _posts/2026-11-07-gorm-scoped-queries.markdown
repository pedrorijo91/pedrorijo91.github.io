---
layout: post

title: 'Type-safe scoped queries in Go with GORM'
date: 2026-11-07 12:00:00
description: 'How to enforce tenant isolation at the repository layer using GORM scoped queries'

tags: [go, gorm, development practices]
---

Multi-tenant applications have a critical invariant: a user must never see another user's data. This sounds obvious, but in practice it only takes one forgotten `WHERE` clause for a data leak to happen. If your application has users grouped into organizations, companies, or teams, every database query touching tenant data must be scoped to the right tenant.

The typical approach is to add a `WHERE organization_id = ?` to each query and rely on code reviews to catch any omissions. But code reviews are fallible, and a missed filter in a single query can expose sensitive data. What if we could make it structurally impossible to forget?

In this post I will walk through a pattern I have been using with [GORM](https://gorm.io/) that enforces tenant scoping at the type level, so the compiler and your linter do the checking instead of relying on human reviewers.

### The usual layered architecture

Most Go web applications follow a familiar structure:

- **Handler layer** — parses the HTTP request, extracts the authenticated user, calls the service layer, and writes the response.
- **Service layer** — orchestrates business logic, calls one or more repositories.
- **Repository layer** — talks to the database through GORM.

A naive repository might look like this:

```go
type OrderRepository struct {
    db *gorm.DB
}

func (r *OrderRepository) GetOrder(orderID string) (*Order, error) {
    var order Order
    err := r.db.Where("id = ?", orderID).First(&order).Error
    return &order, err
}
```

The problem is clear: nothing stops a user from fetching an order that belongs to a different organization. The developer has to remember to add the scope every single time:

```go
func (r *OrderRepository) GetOrder(orgID, orderID string) (*Order, error) {
    var order Order
    err := r.db.Where("id = ? AND organization_id = ?", orderID, orgID).First(&order).Error
    return &order, err
}
```

This works, but it relies on discipline. Every new query, every new repository method, every new developer on the team must remember the rule. And if someone forgets, the bug is silent: the query succeeds, it just returns data it should not.

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
type OrderRepository struct{}

func (r *OrderRepository) GetOrder(qc *QueryClient, orderID string) (*Order, error) {
    var order Order
    err := qc.DB().Where("id = ?", orderID).First(&order).Error
    return &order, err
}

func (r *OrderRepository) ListOrders(qc *QueryClient) ([]Order, error) {
    var orders []Order
    err := qc.DB().Find(&orders).Error
    return orders, err
}
```

The generated SQL for `ListOrders` will automatically include `WHERE organization_id = ?` because the scope was applied when the `QueryClient` was created. Developers writing repository methods do not need to think about it.

### Wiring it through the layers

The handler layer is where we know who the user is, so that is where the `QueryClient` is created:

```go
func (h *OrderHandler) GetOrder(w http.ResponseWriter, r *http.Request) {
    user := auth.UserFromContext(r.Context()) // extracted from JWT or session
    orderID := chi.URLParam(r, "orderID")

    qc := NewQueryClient(h.db, user.OrganizationID)
    order, err := h.orderService.GetOrder(qc, orderID)
    // ...
}
```

The service layer passes the `QueryClient` along:

```go
type OrderService struct {
    orderRepo *OrderRepository
}

func (s *OrderService) GetOrder(qc *QueryClient, orderID string) (*Order, error) {
    return s.orderRepo.GetOrder(qc, orderID)
}
```

At no point does any layer have access to an unscoped `*gorm.DB` for tenant data. The only place that creates a `QueryClient` is the handler, right after authentication, making it easy to audit.

### Transactions

GORM transactions give you a new `*gorm.DB` instance, so the scoped `QueryClient` integrates naturally:

```go
func (qc *QueryClient) Transaction(fn func(txQC *QueryClient) error) error {
    return qc.db.Transaction(func(tx *gorm.DB) error {
        txQC := &QueryClient{
            db:    tx,
            orgID: qc.orgID,
        }
        return fn(txQC)
    })
}
```

Service-layer code that needs a transaction still never touches a raw `*gorm.DB`:

```go
func (s *OrderService) PlaceOrder(qc *QueryClient, req PlaceOrderRequest) error {
    return qc.Transaction(func(txQC *QueryClient) error {
        order := &Order{
            ID:             uuid.New().String(),
            OrganizationID: txQC.OrgID(),
            // ...
        }
        if err := s.orderRepo.Create(txQC, order); err != nil {
            return err
        }
        return s.auditRepo.LogEvent(txQC, "order_created", order.ID)
    })
}
```

### Enforcing the pattern with a linter

The pattern already gives us structural safety, but we can go further. A simple linter rule or a [go-vet analyzer](https://pkg.go.dev/golang.org/x/tools/go/analysis) can flag any repository method that accepts `*gorm.DB` instead of `*QueryClient`. This turns a convention into a compile-time (or CI-time) check.

A minimal approach: use `grep` or `ast` inspection to ensure that no exported function in your `repository` package has a `*gorm.DB` parameter. If your team uses [revive](https://github.com/mgechev/revive) or [golangci-lint](https://golangci-lint.run/), a custom rule can enforce this in CI.

Even simpler: keep `*gorm.DB` unexported inside a dedicated `db` package and only export the `QueryClient` constructor. If the only way to get a database handle for queries is through `NewQueryClient`, the scope is enforced by the package boundary itself.

### When you need unscoped access

There are legitimate cases where you need unscoped queries: admin dashboards, background jobs that process data across organizations, or migrations. For those, you can provide a separate, clearly-named constructor:

```go
func NewUnscopedClient(db *gorm.DB) *UnscopedClient {
    return &UnscopedClient{db: db}
}
```

By using a different type (`*UnscopedClient`), repository methods that require tenant scoping cannot accidentally receive an unscoped client. If a method signature expects `*QueryClient`, passing an `*UnscopedClient` is a compile error. This makes the unscoped path explicit and auditable.

### Why not middleware?

A common alternative is to set the tenant scope in HTTP middleware and store it in the request context. While this works, it has a downside: the scoping is implicit. Any function that receives a `context.Context` _might_ have a tenant scope attached, or it might not. There is no type-level guarantee, and nothing prevents a developer from passing a background context to a repository method.

With the `QueryClient` pattern, the guarantee is structural: if you have a `*QueryClient`, the scope is there. If you don't have one, you cannot call the repository method.

### Conclusion

The core idea is simple: make the correct thing easy and the wrong thing impossible (or at least hard). By replacing raw `*gorm.DB` access with a scoped `QueryClient`:

- Every query is scoped by default — no discipline required.
- The compiler prevents passing the wrong type.
- A linter or package boundary prevents bypassing the pattern.
- Unscoped access is explicit and easy to audit.

While nowadays we can try to enforce these rules through AI-assisted code reviews, type safety and linter checks are more deterministic and reliable. They do not depend on the reviewer's attention or the AI model's context window. When it comes to data isolation, deterministic guarantees beat best-effort checks.
