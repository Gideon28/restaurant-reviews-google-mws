const gulp = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync').create();
const eslint = require('gulp-eslint');
const minify = require('gulp-minify');
const cleanCSS = require('gulp-clean-css');
const babel = require('gulp-babel');

gulp.task('default', ['styles'], function() {
  gulp.watch('sass/**/*/*.scss', ['styles']);
  // gulp.watch('js/**/*.js', ['lint', 'scripts']);
  gulp.watch('js/**/*.js', ['scripts']);

  browserSync.init({
    server: './'
  });
});

gulp.task('scripts', function() {
  return gulp.src(['!js/main.bak.js', '!js/lazyload.js', 'js/**/*.js'])
    .pipe(babel())
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