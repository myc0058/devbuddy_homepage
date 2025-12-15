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

// Build for production - copies all files to dist folder with minified CSS reference
function buildDist(cb) {
	var fs = require('fs');
	var path = require('path');
	var glob = require('glob');
	
	// Helper function to copy directory recursively
	function copyDir(src, dest) {
		if (!fs.existsSync(dest)) {
			fs.mkdirSync(dest, { recursive: true });
		}
		var files = fs.readdirSync(src);
		files.forEach(function(file) {
			var srcPath = path.join(src, file);
			var destPath = path.join(dest, file);
			var stat = fs.statSync(srcPath);
			if (stat.isDirectory()) {
				copyDir(srcPath, destPath);
			} else {
				fs.copyFileSync(srcPath, destPath);
			}
		});
	}
	
	// Create dist folder if not exists
	if (!fs.existsSync('../dist')) {
		fs.mkdirSync('../dist');
	}
	
	// Copy HTML files and replace layout.css with layout.min.css
	glob.sync('../HTML/*.html').forEach(function(file) {
		var content = fs.readFileSync(file, 'utf8');
		content = content.replace(/css\/layout\.css/g, 'css/layout.min.css');
		var filename = path.basename(file);
		fs.writeFileSync('../dist/' + filename, content);
		console.log('✓ Built: ' + filename + ' (using layout.min.css)');
	});
	
	// Copy CSS folder
	console.log('\nCopying CSS files...');
	copyDir('../HTML/css', '../dist/css');
	console.log('✓ CSS files copied');
	
	// Copy JS folder
	console.log('\nCopying JS files...');
	copyDir('../HTML/js', '../dist/js');
	console.log('✓ JS files copied');
	
	// Copy img folder
	console.log('Copying image files...');
	copyDir('../HTML/img', '../dist/img');
	console.log('✓ Image files copied');
	
	// Copy vendor folder
	console.log('Copying vendor files...');
	copyDir('../HTML/vendor', '../dist/vendor');
	console.log('✓ Vendor files copied');
	
	console.log('\n✓ Production build complete!');
	console.log('  - All files ready in: ../dist/');
	console.log('  - layout.css contains optimized (minified) content');
	console.log('  - Deploy the contents of ../dist/ to your server');
	cb();
}

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