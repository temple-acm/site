var gulp = require('gulp');
var less = require('gulp-less');
var minifyCSS = require('gulp-minify-css');
var livereload = require('gulp-livereload');

// Task responsible for less
gulp.task('less', function() {
    gulp.src(['public/less/main.less'])
        .pipe(less())
        .pipe(minifyCSS())
        .pipe(gulp.dest('public/css'));
});

gulp.task('default', ['less'], function() {
    livereload.listen();
    gulp.watch('public/js/**', function(event) {
        livereload.changed();
    });
    gulp.watch('public/less/**', function(event) {
        gulp.run('less');
        livereload.changed();
    });
    gulp.watch('public/pages/**', function(event) {
        livereload.changed();
    });
});