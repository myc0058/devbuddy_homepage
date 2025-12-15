// --------------------------------------------------
// [Gulpfile]
// --------------------------------------------------

'use strict';
 
var gulp 		= require('gulp'),
	sass 		= require('gulp-sass')(require('sass')),
	cleanCSS 	= require('gulp-clean-css'),
	rtlcss 		= require('gulp-rtlcss'),
	rename 		= require('gulp-rename'),
	uglify 		= require('gulp-uglify'),
	pump 		= require('pump'),
	htmlhint  	= require('gulp-htmlhint');


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
	return gulp.src('../HTML/sass/**/*.scss')
		.pipe(sass({ outputStyle: 'expanded' }))
		.on('error', sass.logError)
		.pipe(gulp.dest('../HTML/css/'));
}


// Minify CSS
function minifyCSS(cb) {
	// Theme
    gulp.src(['../HTML/css/layout.css', '!../HTML/css/layout.min.css'])
        .pipe(cleanCSS({debug: true}, function(details) {
            console.log(details.name + ': ' + details.stats.originalSize);
            console.log(details.name + ': ' + details.stats.minifiedSize);
        }))
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('../HTML/css/'));

    // RTL
    return gulp.src(['../HTML/css/layout-rtl.css', '!../HTML/css/layout-rtl.min.css'])
        .pipe(cleanCSS({debug: true}, function(details) {
            console.log(details.name + ': ' + details.stats.originalSize);
            console.log(details.name + ': ' + details.stats.minifiedSize);
        }))
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('../HTML/css/'));
}


// RTL CSS - Convert LTR CSS to RTL.
function rtlConvert(cb) {
	return gulp.src(['../HTML/css/layout.css', '!../HTML/css/layout.min.css', '!../HTML/css/layout-rtl.css', '!../HTML/css/layout-rtl.min.css'])
		.pipe(rtlcss())
		.pipe(rename({ suffix: '-rtl' }))
		.pipe(gulp.dest('../HTML/css/'));
}


// Minify JS - Minifies JS
function minifyJS(cb) {
  	return pump([
	        gulp.src(['../HTML/js/**/*.js', '!../HTML/js/**/*.min.js']),
	        uglify(),
			rename({ suffix: '.min' }),
	        gulp.dest('../HTML/js/')
		],
		cb
	);
}


// Htmlhint - Validate HTML
function validateHTML(cb) {
	return gulp.src('../HTML/*.html')
		.pipe(htmlhint())
		.pipe(htmlhint.reporter())
	  	.pipe(htmlhint.failReporter({ suppress: true }))
}


// --------------------------------------------------
// [Gulp Task - Watch]
// --------------------------------------------------

// Watch task
function watch(cb) {
    gulp.watch('../HTML/sass/**/*.scss', sassCompile);
    gulp.watch('../HTML/css/layout.css', minifyCSS);
    gulp.watch('../HTML/css/layout.css', rtlConvert);
    gulp.watch('../HTML/js/**/*.js', minifyJS);
    gulp.watch('../HTML/*.html', validateHTML);
}

// Lets us type "gulp" on the command line and run all of our tasks
gulp.task('default', gulp.series(sassCompile, minifyCSS, rtlConvert, minifyJS, validateHTML, watch));

// Production task - build all and prepare for deployment
gulp.task('prod', gulp.series(sassCompile, minifyCSS, rtlConvert, minifyJS, validateHTML, buildDist));

// This handles watching and running tasks
gulp.task('watch', watch);