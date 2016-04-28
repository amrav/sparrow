import gulp from 'gulp';
import gutil from 'gulp-util';
import sourcemaps from 'gulp-sourcemaps';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import browserify from 'browserify';
import watchify from 'watchify';
import babel from 'babelify';
import chalk from 'chalk';
import eslint from 'gulp-eslint';

const log = (msg) => {
    const t = /T([0-9:.]+)Z/g.exec(new Date().toISOString())[1];
    console.log(
        chalk.green(`[${t}] gulp`),
        "::",
        chalk.cyan(msg)
    );
};

gulp.task('lint', () => {
    return gulp.src(['**/*.js', '!node_modules/**', '!build/**'])
        .pipe(eslint())
        .pipe(eslint.formatEach())
        .pipe(eslint.failAfterError());
});

const babelConfig = {
    plugins: ["transform-object-rest-spread"],
    presets: ["es2015", "react"],
    env: {
        development: {
            plugins: [
                ["react-transform", {
                    transforms: [{
                        transform: "livereactload/babel-transform",
                        imports: ["react"]
                    }]
                }]
            ]
        }
    }
};

const browserifyOpts = {
    entries: ['./src/index.js'],
    debug: true
};

function compile(watch) {

    var bundler = watchify(
            browserify('./src/index.js', {...watchify.args, browserifyOpts}))
            .transform(babel.configure(babelConfig))
            .plugin('livereactload');

    function rebundle() {
        log('Bundling...');
        bundler.bundle()
            .on('error', (err) => {
                gutil.log(gutil.colors.red('Browserify Error:'), err.message);
            })
            .pipe(source('bundle.js'))
            .pipe(buffer())
            .pipe(sourcemaps.init({ loadMaps: true }))
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest('./build'))
            .on('end', () => {
                log('Finished bundling');
            });
    }

    if (watch) {
        bundler.on('update', function() {
            rebundle();
        });
    }

    rebundle();
}

function watch() {
    return compile(true);
}

gulp.task('build', () => compile());
gulp.task('watch', () => watch());

gulp.task('default', ['watch']);
