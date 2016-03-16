var gulp = require('gulp');
var html2jade = require('gulp-html2jade')

var options = {nspaces:2};
gulp.task('html2jade', function(){
  gulp.src('/views/*.html')
    .pipe(html2jade(options))
    .pipe(gulp.dest('jade'));
});
