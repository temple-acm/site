var gulp = require('gulp');
var fs = require('fs');
var rename = require('gulp-rename');
var open = require('open');
// CSS related build tools
var less = require('gulp-less');
var minifyCSS = require('gulp-minify-css');
// Client JS related build tools
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
// Server JS related build tools
var nodemon = require('gulp-nodemon');

// Task responsible for less
gulp.task('less', function() {
    // Build it
    gulp.src(['public/less/main.less'])
        .pipe(less())
        .pipe(gulp.dest('public/dist'));
    // Minify it
    gulp.src('public/dist/main.css')
        .pipe(rename('main.min.css'))
        .pipe(minifyCSS())
        .pipe(gulp.dest('public/dist'));
});
// Task responsible for running the server
gulp.task('server', function() {
    nodemon({
        script: 'server.js',
        ext: 'js',
        ignore: ['public/*']
    }).on('start', function() {
        setTimeout(function() {
            open('https://localhost:3000/');
        }, 1000);
    });
});
// Task responsible for assembling js
gulp.task('js', function() {
    // Build it
    gulp.src('public/js/*.js')
        .pipe(sourcemaps.init())
        .pipe(concat('main.js'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('public/dist'));
    // Minify it
    gulp.src('public/dist/main.js')
        .pipe(rename('main.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('public/dist'));
});
// Task readies for deployment
gulp.task('deploy', ['less', 'js'], function() {});
// Starts the dev server
gulp.task('default', ['less', 'js', 'server'], function() {
    gulp.watch('public/js/**', ['js']);
    gulp.watch('public/less/**', ['less']);
});