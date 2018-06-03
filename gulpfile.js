var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var browserSync = require('browser-sync').create();
var eslint = require('gulp-eslint');
var minify = require('gulp-minify');
var cleanCSS = require('gulp-clean-css');

gulp.task('default', ['styles', 'lint'], function() {
  gulp.watch('sass/**/*/*.scss', ['styles']);
  gulp.watch('js/**/*.js', ['lint', 'scripts']);

  browserSync.init({
    server: './'
  });
});

gulp.task('scripts', function() {
  return gulp.src(['js/**/*.js'])
    .pipe(minify())
    .pipe(gulp.dest('dist/js/'))
})

gulp.task('styles', function() {
  gulp.src('sass/**/*.scss')
    .pipe(sass({
      includePaths: require('node-normalize-scss').includePaths
    }).on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: ['last 2 versions']
    }))
    .pipe(cleanCSS())
    .pipe(gulp.dest('dist/css/'))
    .pipe(browserSync.stream());
});

gulp.task('lint', function() {
  return gulp.src(['js/**/*.js'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failOnError());
});