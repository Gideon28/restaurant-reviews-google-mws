const gulp = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync').create();
const eslint = require('gulp-eslint');
const minify = require('gulp-minify');
const cleanCSS = require('gulp-clean-css');
const babel = require('gulp-babel');
const critical = require('critical');
const log = require('fancy-log');
const concat = require('gulp-concat');

gulp.task('default', ['copy-html', 'copy-images', 'styles', 'home-scripts', 'restaurant-scripts', 'scripts'], function() {
  gulp.watch('sass/**/*/*.scss', ['styles']);
  // gulp.watch('js/**/*.js', ['lint', 'scripts']);
  gulp.watch('js/**/*.js', ['home-scripts', 'restaurant-scripts', 'scripts']);
  gulp.watch('./index.html', ['copy-html']);
  gulp.watch('./dist/index.html')
    .on('change', browserSync.reload);

  browserSync.init({
    server: './'
  });
});

gulp.task('scripts',['home-scripts', 'restaurant-scripts'], function() {
  return gulp.src(['!js/main.bak.js', '!js/lazyload.js', 'js/**/*.js'])
    .pipe(babel())
    .pipe(gulp.dest('dist/js/'))
})

gulp.task('home-scripts', function() {
  return gulp.src(['js/dbhelper.js', 'js/main.js', 'js/lazyload.js'])
    .pipe(concat('all-home.js'))
    .pipe(minify())
    .pipe(gulp.dest('./js'))
});
gulp.task('restaurant-scripts', function() {
  return gulp.src(['js/dbhelper.js', 'js/restaurant_info.js'])
    .pipe(concat('all-restaurant.js'))
    .pipe(minify())
    .pipe(gulp.dest('./js'))
});

gulp.task('copy-html', function() {
  gulp.src('./index.html')
    .pipe(gulp.dest('./dist'));
});
gulp.task('copy-images', function() {
  gulp.src('img/*')
    .pipe(gulp.dest('dist/img'));
});

gulp.task('styles', function() {
  gulp.src('sass/**/*.scss')
    .pipe(sass({
      includePaths: require('node-normalize-scss').includePaths,
      outputStyle: 'compressed'
    }).on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: ['last 2 versions']
    }))
    .pipe(cleanCSS())
    .pipe(gulp.dest('dist/css/'))
    .pipe(browserSync.stream());
});

gulp.task('critical', function(cb) {
  critical.generate({
      inline: true,
      base: './',
      src: 'index.html',
      dest: 'index-critical.html',
      width: 1300,
      height: 900,
      minify: true
    });
});

gulp.task('lint', function() {
  return gulp.src(['js/**/*.js'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failOnError());
});