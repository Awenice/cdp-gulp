var gulp = require('gulp'),
    bower = require('gulp-bower'),
    less = require('gulp-less'),
    del = require('del'),
    util = require('gulp-util'),
    cached = require('gulp-cached'),
    remember = require('gulp-remember'),
    autoprefixer = require('gulp-autoprefixer'),
    csso = require('gulp-csso'),
    concat = require('gulp-concat'),
    gulpif = require('gulp-if'),
    imagemin = require('gulp-imagemin'),
    spritesmith = require('gulp.spritesmith'),
    htmlreplace = require('gulp-html-replace'),
    uglify = require('gulp-uglify'),
    browserify = require('browserify'),
    debowerify = require("debowerify"),
    watchify = require('watchify'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    babel = require('gulp-babel'),
    sourcemaps = require('gulp-sourcemaps'),
    plumber = require('gulp-plumber'),
    eslint = require('gulp-eslint');

var argv = require('minimist')(process.argv.slice(2), {
    string: 'env',
    default: {env: process.env.NODE_ENV || 'development'}
});

var conf = {
    less: 'src/less/*.less',
    images: ['src/images/**/*.{png,svg}', '!src/images/icons/**'],
    icons: 'src/images/icons/*.png',
    html: 'src/*.html',
    js: 'src/js/**/*.js',
    mainJs: 'src/js/main.js',
    sprite: {
        imgName: 'images/build/sprite.png',
        cssName: 'less/build/sprite.less',
        imgPath: '../images/build/sprite.png'
    },
    build: {
        tmpFolders: '**/build',
        folder: 'build',
        css: 'build/css',
        images: 'build/images',
        js: 'build/js',
        html: 'build/html'
    }
};

var bootstrap = {
    less: 'bower_components/bootstrap/less/bootstrap.less'
};

gulp.task('bower', function () {
    return bower()
        .pipe(gulp.dest('bower_components'));
});

gulp.task('style', ['clean', 'bower', 'images'], function () {
    return gulp.src([bootstrap.less, conf.less])
        .pipe(gulpif(argv.env !== 'production', sourcemaps.init()))
        .pipe(less())
        .pipe(autoprefixer(['last 2 version']))
        .pipe(concat('cdp.css'))
        .pipe(gulpif(argv.env !== 'production', sourcemaps.write(), csso()))
        .pipe(gulp.dest(conf.build.css));
});

gulp.task('style-watch', function () {
    return gulp.src([bootstrap.less, conf.less])
        .pipe(plumber({
            errorHandler: errorHandler
        }))
        .pipe(sourcemaps.init())
        .pipe(cached())
        .pipe(less())
        .pipe(autoprefixer(['last 2 version']))
        .pipe(remember())
        .pipe(concat('cdp.css'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(conf.build.css))
});

gulp.task('images', ['clean', 'bower', 'sprite'], function () {
    return gulp.src(conf.images)
        .pipe(gulpif(argv.env === 'production', imagemin()))
        .pipe(gulp.dest(conf.build.images))
});

gulp.task('sprite', ['clean'], function () {
    return gulp.src(conf.icons)
        .pipe(spritesmith(conf.sprite))
        .pipe(gulp.dest('src/'));
});

gulp.task('html', ['clean'], function () {
    return gulp.src(conf.html)
        .pipe(htmlreplace({
            'css': '../css/cdp.css',
            'js': '../js/cdp.js',
            'logo': {
                src: '../images/logo_gray-blue_80px.svg',
                tpl: '<img src="%s" alt="Epam logo"/>'
            }
        }))
        .pipe(gulp.dest(conf.build.html));
});

var b = watchify(browserify(conf.mainJs, {debug: true}))
    .transform(debowerify);

function bundle() {
    return b
        .bundle()
        .pipe(source('cdp.js'))
        .pipe(buffer())
        .pipe(babel({
            presets: ['es2015'],
            compact: false,
            sourceMaps: 'inline'
        }))
        .pipe(gulpif(argv.env === 'production', uglify()))
        .pipe(gulp.dest(conf.build.js));
}

gulp.task('script', ['clean', 'bower', 'eslint'], function () {
    return bundle();
});

gulp.task('eslint', function () {
    return gulp.src(conf.js)
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('clean', function () {
    return del([conf.build.folder, conf.build.tmpFolders]);
});

gulp.task('build', ['style', 'html', 'script']);

gulp.task('watch', ['build'], function () {
    b.on('update', bundle);
    b.on('log', util.log);
    gulp.watch(conf.less, ['style-watch']);
    gulp.watch(conf.js, ['eslint']);
});

function errorHandler(error) {
    util.log(util.colors.red('Error'), error.message);

    this.emit('end');
}