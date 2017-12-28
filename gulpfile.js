var gulp = require('gulp');
var uglify = require("gulp-uglify");
var less = require("gulp-less");
var minifyCss = require("gulp-minify-css");
var livereload = require('gulp-livereload');
var connect = require('gulp-connect');
var minimist = require('minimist');

var knownOptions = {
  string: 'env',
  default: { env: process.env.NODE_ENV || 'production' }
};

var options = minimist(process.argv.slice(2), knownOptions);

// js文件压缩
gulp.task('minify-js', function() {
    gulp.src('src/js/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('dist/'));
});

// js移动文件
gulp.task('move-js', function() {
    gulp.src('src/js/*.js')
        .pipe(gulp.dest('dist/'))
        .pipe(connect.reload());
});

// less编译
gulp.task('compile-less', function() {
    gulp.src('src/css/*.less')
        .pipe(less())
        .pipe(gulp.dest('dist/'))
        .pipe(connect.reload());
});

// less文件编译压缩
gulp.task('compile-minify-css', function() {
    gulp.src('src/css/*.less')
        .pipe(less())
        .pipe(minifyCss())
        .pipe(gulp.dest('dist/'));
});

// html页面自动刷新
gulp.task('html', function () {
  gulp.src('views/*.html')
    .pipe(connect.reload());
});

// 页面自动刷新启动
gulp.task('connect', function() {
    connect.server({
        livereload: true
    });
});

// 监测文件的改动
gulp.task('watch', function() {
    gulp.watch('src/css/*.less', ['compile-less']);
    gulp.watch('src/js/*.js', ['move-js']);
    gulp.watch('views/*.html', ['html']);
});

// 激活浏览器livereload友好提示
gulp.task('tip', function() {
    console.log('\n<----- 请用chrome浏览器打开 http://localhost:5000 页面，并激活livereload插件 ----->\n');
});

if (options.env === 'development') {
    gulp.task('default', ['move-js', 'compile-less', 'connect', 'watch', 'tip']);
}else{
    gulp.task('default', ['minify-js', 'compile-minify-css']);
}




