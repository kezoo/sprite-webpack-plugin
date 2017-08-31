import fs from 'fs';
import path from 'path';
import _ from './underscore';
import mkdirp from 'mkdirp';
import imageinfo from './imageinfo';

const imageTypes = ['png', 'jpg', 'jpeg', 'gif'];

const getPiece = (item, slice, sign) => {
  sign = sign || "";
  var splits = item.split(sign), length = splits.length;
  return splits[length - slice];
}

const backslashToSlash = (item) => {
  return item.replace(/\\/g, '\/');
}

const isImage = (filename) => {
  var ext = filename.split('.').pop();
  return _.include(imageTypes, ext);
}

const isPathExist = (path) => {
  if (!path) return false;
  return fs.existsSync(path);
}

const walkFiles = (params) => {
  if (!params || !_.isObject(params)) return;

  let imagesData = [];
  const baseName = params.baseName;
  const tConnector = params.connector;
  const tMargin = params.tMargin;
  const sourceDir = params.sourceDir || false;
  const isSourceDirExist = isPathExist(sourceDir);

  (_.isUndefined(sourceDir) || _.isEmpty(sourceDir) || !sourceDir) && throwError('noSourceDir', 'throw');

  !isSourceDirExist && throwError('noSourceDir', 'throw');

  const walkDir = (DIRPATH, DIRNAME) => {
    if (!DIRPATH || !DIRNAME) return false;

    const walkedFiles = fs.readdirSync(DIRPATH);
    const filesData = {
      dirName: DIRNAME,
      dirPath: DIRPATH,
      files: [],
    };

    _.isEmpty(walkedFiles) && throwError('noImages');

    if (!_.isEmpty(walkedFiles)) {

      walkedFiles.forEach( (item) => {

        const filePath = path.join(DIRPATH, item)
        const fileState = fs.lstatSync(filePath);
        const isFile = fileState.isFile();
        const isImg = isFile && isImage(item);
        const isDir = fileState.isDirectory();

        if (isFile && isImg) {
          const imgBuffer = fs.readFileSync(filePath);
          const imageInfo = imageinfo(imgBuffer);

          const imgData = {
            item: item,
            imgPath: filePath,
            imgBuffer: imgBuffer,
            imgName: item.split('.').shift().replace(/\s/g, ''),
            width: imageInfo.width,
            height: imageInfo.height + tMargin,
            format: imageInfo.format,
          }
          filesData.files.push(imgData);
        }

        if (isDir) {
          const subBaseName = path.basename(filePath);
          subBaseName && walkDir(filePath, subBaseName);
        }

      });

      imagesData.push(filesData);
    }
  }

  walkDir(sourceDir, baseName);

  return imagesData;
}

const throwError = (errorType, action) => {
  const errors = {
    default: 'There\'s an error',
    noSourceDir: 'The source dir is missing or could not be found',
    noImages: 'no images in the source directory',
    noLayout: 'There\'s something wrong with sprite layout',
    noConfig: 'Config is missing',
    noCsspath: 'Csspath is not valid',
    noImgpath: 'Imgpath is not valid',
    invalidRetina: 'Retina value is not valid and will be ingored',
    cssTplProblem: 'There\'s something wrong with generating css template',
  }

  const consColor = {
    warn: '\x1b[33m%s\x1b[0m',
  }

  const errMsg = errorType && _.includes(Object.keys(errors), errorType)
                 ? errors[errorType] : errors.default;

  const takeAction = (_.isUndefined(action) || !action) ? 'warn' : action;

  switch (action) {

    case 'throw':
      throw new Error(errMsg);
      return;
    case 'warn':
      console.warn(consColor.warn, errMsg);
      return;
    default:
      console.warn(consColor.warn, errMsg);
      return;
  }

}

const capitalize = (words) => {
  if (!_.isArray(words) || _.isEmpty(words)) return false;

  const cap = (word) => (
    word.charAt(0).toUpperCase() + word.substring(1).toLowerCase()
  );

  return words.map( (item) => cap(item)).join('');
}

const formatWords = (words, method) => {
  if (!_.isArray(words) || _.isEmpty(words)) return false;

  const methods = [ '-', '_', 'capitalize', ''];
  const tDefault = methods[0];
  const tMethod = _.some(methods, (item) => item === method ) ? method : tDefault;

  const transWords = (sign) => (
    words.map( (item) => item.toLowerCase()).join(sign)
  )

  switch (tMethod) {
    case '-':
      return transWords('-');
    case '_':
      return transWords('_');
    case 'capitalize':
      return capitalize(words);
    default:
      return transWords('');
  }
}

const isInteger = (number) => {
  if (!number || !_.isNumber(number)) return;

  return number % 1 === 0;
}

module.exports = {

  BaseDirName: 'F0UNKNOWNNAME0K',

  imageTypes: imageTypes,

  isPathExist: isPathExist,

  backslashToSlash: backslashToSlash,

  isImage: isImage,

  walkFiles: walkFiles,

  throwError: throwError,

  capitalize: capitalize,

  formatWords: formatWords,

  isInteger: isInteger,

};

