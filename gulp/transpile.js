import gulp from 'gulp';
import bg from 'gulp-bg';
import fs from 'fs';
import path from 'path';

import { existsSync } from './utils/utils'

const sourceDirPath = path.normalize('./lib');
const targetDirPath = path.normalize('./dist');

gulp.task('transpile', done => {
  const babelPaths = [
    'node_modules/.bin/babel.cmd',
    'node_modules/.bin/babel',
  ].map((babelPath) => path.normalize(babelPath));

  const babelPath = babelPaths.find(path => existsSync(path));

  if (babelPath == null) {
    throw new Error(`Cannot find babel executable; tried: ${babelPaths}`);
  };

  const indexJs = 'index.js';

  bg(
    babelPath,
    indexJs,
    '--out-file',
    path.join(targetDirPath, indexJs),
  )();

  bg(
    babelPath,
    sourceDirPath,
    '--out-dir',
    path.join(targetDirPath, sourceDirPath),
  )(done);
});
