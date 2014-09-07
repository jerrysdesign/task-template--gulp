var gulp = require('gulp'),
  connect = require('gulp-connect'),
  $ = require('gulp-load-plugins')();

var iconfont = {
  stylusFileName: '_font.styl'
};

var path = (function () {
  var _path = {
    source: 'app/',
    build: '_publish/'
  };

  _path.sourceHtml = _path.source + 'html/';
  _path.sourceStyle = _path.source + 'style/';
  _path.sourceScript = _path.source + 'script/';
  _path.sourceImage = _path.source + 'images/';

  return _path;
})();



gulp.task('html', function () {
  return gulp.src(path.sourceHtml + '*.html')
    .pipe($.plumber())
    .pipe($.minifyHtml({
      quotes: true
    }))
    .pipe(gulp.dest(path.build))
    .pipe(connect.reload());
});



gulp.task('css', function () {
  return gulp.src(path.sourceStyle + 'style.styl')
    .pipe($.plumber())
    .pipe($.stylus({
      import: ['tmp/' + iconfont.stylusFileName]
    }))
    .pipe($.autoprefixer())
    .pipe($.minifyCss())
    .pipe(gulp.dest(path.build + 'css/'))
    .pipe(connect.reload());
});



gulp.task('js', function () {
  return gulp.src(path.sourceScript + '**/*.js')
    .pipe($.plumber())
    .pipe($.concat('script.js'))
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.uglify())
    .pipe(gulp.dest(path.build + 'js/'))
    .pipe(connect.reload());
});



gulp.task('png-min', ['png-clone-no-compress'],function () {
  return gulp.src([path.sourceImage + '**/*.png', '!' + path.sourceImage + '**/*-no-compress.png'])
    .pipe($.optipng(['-o2', '-strip all']))
    .pipe(gulp.dest(path.build + 'img/'));
});



gulp.task('png-clone-no-compress', function () {
  return gulp.src([path.sourceImage + '**/*-no-compress.png'])
    .pipe(gulp.dest(path.build + 'img/'));
});



gulp.task('iconfont', function () {
  return gulp.src(path.source + 'font/svg/*.svg')
    .pipe($.iconfont({
      fontName: 'myfont',
      // centerHorizontally: true,
      // appendCodepoints: true,
      fixedWidth: true
    }))
    .on('codepoints', function(codepoints, options) {
      // console.log(codepoints, options);
      gulp.src(path.sourceStyle + '_font.styl-temp')
        .pipe($.consolidate('lodash', {
          glyphs: codepoints,
          fontName: 'myfont',
          fontPath: '../font/',
          className: 'appicon'
        }))
        .pipe($.rename(iconfont.stylusFileName))
        .pipe(gulp.dest(path.sourceStyle + 'tmp'));
    })
    .pipe(gulp.dest(path.build + 'font/'));
});



gulp.task('server', function () {
  connect.server({
    livereload: true
  });
});

gulp.task('watch', ['build'], function () {
  gulp.watch(path.sourceHtml + '*.html', ['html']);
  gulp.watch(path.sourceScript + '*.js', ['js']);
  gulp.watch(path.sourceStyle + '**/*.styl', ['css']);
});

gulp.task('deploy', ['build', 'png-min'], function () {
  gulp.src(path.build + '**/*')
    .pipe($.ghPages());
});

gulp.task('build', ['iconfont', 'html', 'css', 'js']);
gulp.task('dev', ['server', 'watch']);
gulp.task('default', ['build']);
