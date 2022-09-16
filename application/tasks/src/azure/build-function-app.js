'use strict'

const path = require('path')
const gulp = require('gulp')
const zip = require('gulp-zip')
const execSync = require('child_process').execSync
const del = require('del')
const replace = require('gulp-replace')

const artifactsDirectoryPath = path.resolve(process.cwd(), '../../.artifacts')
const azureFunctionAppDirectoryPath = path.resolve(process.cwd(), '../apps/azure/function-app')
const outputDirectoryPath = `${artifactsDirectoryPath}/azure-function-app`

/**
 * Remove the ./dist directory.
 */
function clean() {
  return del([`${artifactsDirectoryPath}/azure-function-app`], { force: true })
}

function buildAllFunctions(cb) {
  execSync(
    `esbuild ${azureFunctionAppDirectoryPath}/payment-function/src/index.js` +
      ` --bundle --platform=node --target=node14` +
      ` --outdir=${azureFunctionAppDirectoryPath}/payment-function/dist`,
  )
  execSync(
    `esbuild ${azureFunctionAppDirectoryPath}/notification-function/src/index.js` +
      ` --bundle --platform=node --target=node14` +
      ` --outdir=${azureFunctionAppDirectoryPath}/notification-function/dist`,
  )
  cb()
}

/**
 * Copy all function app files from the appropriate package.
 * We don't need the `node_modules` or `src` folders as these are effectively
 * built in to the `dist/index.js` file in the `buildAllFunctions` task.
 */
function copyFilesForBuild() {
  return gulp
    .src([
      `${azureFunctionAppDirectoryPath}/**/*`,
      `!${azureFunctionAppDirectoryPath}/**/node_modules/**`,
      `!${azureFunctionAppDirectoryPath}/**/src/**`,
    ])
    .pipe(gulp.dest(`${outputDirectoryPath}/`))
}

/**
 * Alter the function.json files to point the `scriptPath` to `dist/index.js`
 * rather than `src/index.js`
 */
function alterFunctionScriptPath() {
  return gulp
    .src([`${azureFunctionAppDirectoryPath}/*/function.json`])
    .pipe(replace('"scriptFile": "./src/index.js"', '"scriptFile": "./dist/index.js"'))
    .pipe(gulp.dest(outputDirectoryPath))
}

/**
 * Zip up the function app
 */
function compress() {
  return gulp
    .src(`${outputDirectoryPath}/**`)
    .pipe(zip('azure-function-app.zip'))
    .pipe(gulp.dest(artifactsDirectoryPath))
}

/**
 * Post-build clean up
 */
function postBuildClean() {
  return del(
    [
      outputDirectoryPath,
      `${azureFunctionAppDirectoryPath}/notification-function/dist/`,
      `${azureFunctionAppDirectoryPath}/payment-function/dist/`,
    ],
    { force: true },
  )
}

/**
 * Build the production function-app.zip file
 */
const buildTask = gulp.series(
  clean,
  buildAllFunctions,
  copyFilesForBuild,
  alterFunctionScriptPath,
  compress,
  postBuildClean,
)

module.exports = buildTask
