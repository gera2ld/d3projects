browserify = require 'browserify'
coffeeify = require 'coffeeify'
source = require 'vinyl-source-stream'
buffer = require 'vinyl-buffer'
gulp = require 'gulp'
concat = require 'gulp-concat'

gulp.task 'build-coffee', ->
  browserify
    entries: './app.coffee'
    basedir: 'src'
    extensions: ['.coffee']
    debug: true
    transform: [
      coffeeify
    ]
  .bundle()
  .pipe source 'app.js'
  .pipe do buffer
  .pipe gulp.dest 'dist'

gulp.task 'build-css', ->
  gulp.src 'src/**/*.css'
    .pipe concat 'style.css'
    .pipe gulp.dest 'dist'

gulp.task 'build', ['build-coffee', 'build-css']
