var gulp = require('gulp');
var less = require('gulp-less');
var minifyCSS = require('gulp-minify-css');
var livereload = require('gulp-livereload');
var nodemon = require('gulp-nodemon');

// Task responsible for less
gulp.task('less', function() {
    gulp.src(['public/less/main.less'])
        .pipe(less())
        .pipe(minifyCSS())
        .pipe(gulp.dest('public/css'));
});
// Task responsible for running the server
gulp.task('server', function() {
    nodemon({
        script: 'server.js',
        ext: 'js',
        ignore: ['public/*']
    });
});

gulp.task('default', ['less', 'server'], function() {
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
