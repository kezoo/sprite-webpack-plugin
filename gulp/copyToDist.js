import gulp from 'gulp';
import fs from 'fs';
import bg from 'gulp-bg';
import path from 'path';
import mkdirp from 'mkdirp';
import { existsSync, walkDir, getNonJsFiles } from './utils/utils'

const targetDirPath = path.normalize('./dist');
const libPath = path.normalize('./lib');

gulp.task('copyToDist', (done) => {

  const dirFiles = walkDir(libPath);

  if (!dirFiles || !Array.isArray(dirFiles) || dirFiles.length === 0) return;

  const nonJsFiles = getNonJsFiles(dirFiles);

  let filePath = null;
  let dirPath = null;
  let destPath = null;

  nonJsFiles.forEach( (item) => {
    filePath = item.path;
    dirPath = item.dirPath;
    destPath = path.join(targetDirPath, dirPath);

    !existsSync(destPath) && mkdirp.sync(destPath);

    fs.createReadStream(filePath).pipe(fs.createWriteStream(path.join(destPath, item.file)));

  });


  const configJs = 'config.js';

  fs.createReadStream(configJs).pipe(fs.createWriteStream(path.join(targetDirPath, configJs)));
});
