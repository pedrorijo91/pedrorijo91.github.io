desc 'jekyll serve'
task :default do
   sh "bundle exec jekyll serve"
 end

desc 'bundle install'
task :install do
   sh 'bundle install'
 end

desc 'bundle update'
task :update do
   sh 'bundle update'
 end

desc 'generate drafts'
task :drafts do
  sh 'bundle exec jekyll serve --drafts'
end

desc 'uglify'
task :compactjs do
    sh 'uglifyjs assets/js/scripts.js > assets/js/scripts.min.js'
    sh 'uglifyjs assets/js/modernizr.custom.15390.js > assets/js/modernizr.custom.15390.min.js'
end
