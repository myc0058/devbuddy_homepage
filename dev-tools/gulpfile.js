// --------------------------------------------------
// [Gulpfile]
// --------------------------------------------------

'use strict';
 
var gulp 		= require('gulp'),
	dartSass 	= require('sass'),
	gulpSass 	= require('gulp-sass'),
	cleanCSS 	= require('gulp-clean-css'),
	rtlcss 		= require('gulp-rtlcss'),
	rename 		= require('gulp-rename'),
	uglify 		= require('gulp-uglify'),
	pump 		= require('pump'),
	htmlhint  	= require('gulp-htmlhint');

const sass = gulpSass(dartSass);


// Gulp plumber error handler
function errorLog(error) {
	console.error.bind(error);
	this.emit('end');
}


// --------------------------------------------------
// [Libraries]
// --------------------------------------------------

// Sass - Compile Sass files into CSS
function sassCompile(cb) {
	return gulp.src('../docs/sass/**/*.scss')
		.pipe(sass.sync({
			outputStyle: 'expanded',
			silenceDeprecations: ['legacy-js-api']
		}))
		.on('error', sass.logError)
		.pipe(gulp.dest('../docs/css/'));
}


// Minify CSS
function minifyCSS(cb) {
	// Theme
    gulp.src(['../docs/css/layout.css', '!../docs/css/layout.min.css'])
        .pipe(cleanCSS({debug: true}, function(details) {
            console.log(details.name + ': ' + details.stats.originalSize);
            console.log(details.name + ': ' + details.stats.minifiedSize);
        }))
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('../docs/css/'));

    // RTL
    return gulp.src(['../docs/css/layout-rtl.css', '!../docs/css/layout-rtl.min.css'])
        .pipe(cleanCSS({debug: true}, function(details) {
            console.log(details.name + ': ' + details.stats.originalSize);
            console.log(details.name + ': ' + details.stats.minifiedSize);
        }))
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('../docs/css/'));
}


// RTL CSS - Convert LTR CSS to RTL.
function rtlConvert(cb) {
	return gulp.src(['../docs/css/layout.css', '!../docs/css/layout.min.css', '!../docs/css/layout-rtl.css', '!../docs/css/layout-rtl.min.css'])
		.pipe(rtlcss())
		.pipe(rename({ suffix: '-rtl' }))
		.pipe(gulp.dest('../docs/css/'));
}


// Minify JS - Minifies JS
function minifyJS(cb) {
  	return pump([
	        gulp.src(['../docs/js/**/*.js', '!../docs/js/**/*.min.js']),
	        uglify(),
			rename({ suffix: '.min' }),
	        gulp.dest('../docs/js/')
		],
		cb
	);
}


// Htmlhint - Validate HTML
function validateHTML(cb) {
	return gulp.src(['../docs/*.html', '!../docs/naver0874a19600a0ac3c7a358d1079f988b8.html'])
		.pipe(htmlhint())
		.pipe(htmlhint.reporter())
	  	.pipe(htmlhint.failReporter({ suppress: true }))
}


// --------------------------------------------------
// [Gulp Task - Watch]
// --------------------------------------------------

// Watch task
function watch(cb) {
    gulp.watch('../docs/sass/**/*.scss', sassCompile);
    gulp.watch('../docs/css/layout.css', minifyCSS);
    gulp.watch('../docs/css/layout.css', rtlConvert);
    gulp.watch('../docs/js/**/*.js', minifyJS);
    gulp.watch('../docs/*.html', validateHTML);
}

gulp.task('build', gulp.series(sassCompile, minifyCSS, rtlConvert, minifyJS, validateHTML));

// Lets us type "gulp" on the command line and run all of our tasks
gulp.task('default', gulp.series(sassCompile, minifyCSS, rtlConvert, minifyJS, validateHTML, watch));

// This handles watching and running tasks
gulp.task('watch', watch);