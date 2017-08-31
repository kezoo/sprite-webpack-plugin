import fs from 'fs';
import path from 'path';
import mkdirp from 'mkdirp';

export const existsSync = path => {
  try {
    fs.statSync(path);
    return true;
  } catch (e) {
    return false;
  }
};

export const walkDir = (dirPath) => {

  let tFiles = [];

  const walkDirFunc = (tPath) => {

    if (!existsSync(tPath)) {
      throw new Error(`Cannot find source dir; tried: ${tPath}`);
    }

    const walkedFiles = fs.readdirSync(tPath);

    if (!walkedFiles || walkedFiles.length === 0) return false;

    let filePath = null;
    let fileState = null;
    let isDir = null;
    let isFile = null;
    let fileExt = null;

    walkedFiles.forEach( (item) => {
      filePath = path.join(tPath, item)
      fileState = fs.lstatSync(filePath);
      isFile = fileState.isFile();
      isDir = fileState.isDirectory();
      fileExt = path.extname(filePath);

      if (isFile) {
        tFiles.push({
          file: item,
          dirName: path.parse(tPath).base,
          dirPath: tPath,
          path: filePath,
          ext: fileExt.indexOf('.') === 0 ? fileExt.substring(1) : fileExt
        });
      }

      isDir && walkDirFunc(filePath);
    });
  }

  walkDirFunc(dirPath);

  return tFiles;
}

export const getNonJsFiles = (filesList) => {
  if (!filesList || !Array.isArray(filesList) || filesList.length === 0) return false;

  filesList = filesList.filter( (item) => item.ext !== 'js');

  return filesList;
}
