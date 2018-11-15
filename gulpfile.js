
const path = require("path");
const gulp = require('gulp');
const clean = require("gulp-clean");
const yargs = require("yargs");
const {execSync, exec} = require('child_process');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const tslint = require('gulp-tslint');

const args =  yargs.argv;

const distFolder = 'dist';

gulp.task('clean', gulp.series(() => {
    return gulp.src([distFolder, '*.vsix'], {allowEmpty: true})
        .pipe(clean());
}));

gulp.task('tslint', gulp.series(() => {
    return gulp.src(["scripts/**/*ts", "scripts/**/*tsx"])
        .pipe(tslint({
            formatter: "verbose",
            fix: true,
        }))
        .pipe(tslint.report());
}));
gulp.task('styles', gulp.parallel(async () => {
    execSync("node ./node_modules/sass/sass.js ./styles/attachmentGroup.scss ./dist/attachmentGroup.css", {
        stdio: [null, process.stdout, process.stderr]
    });
}, async () => {
    execSync("node ./node_modules/sass/sass.js ./styles/imageGallery.scss ./dist/imageGallery.css", {
        stdio: [null, process.stdout, process.stderr]
    });
}
));

gulp.task('copy', gulp.series(() => {
    return gulp.src('node_modules/vss-web-extension-sdk/lib/VSS.SDK.min.js')
        .pipe(gulp.dest(distFolder));
}));

gulp.task('build', gulp.parallel('styles', 'tslint', 'copy', async () => {
    const option = yargs.argv.release ? "-p" : "-d";
    execSync(`node ./node_modules/webpack-cli/bin/cli.js ${option}`, {
        stdio: [null, process.stdout, process.stderr]
    });
    // return webpack(require('./webpack.config.js'));
}));

gulp.task('package', gulp.series('clean', 'build', async () => {
    const overrides = {}
    if (yargs.argv.release) {
        overrides.public = true;
    } else {
        const manifest = require('./vss-extension.json');
        overrides.name = manifest.name + ": Development Edition";
        overrides.id = manifest.id + "-dev";
    }
    const overridesArg = `--override "${JSON.stringify(overrides).replace(/"/g, '\\"')}"`;
    const manifestsArg = `--manifests vss-extension.json`;

    exec(`tfx extension create ${overridesArg} ${manifestsArg} --rev-version`,
        (err, stdout, stderr) => {
            if (err) {
                console.log(err);
            }

            console.log(stdout);
            console.log(stderr);
            
        });
}));

gulp.task('default', gulp.series('package'));
