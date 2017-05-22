'use strict';

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _underscore = require('./underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _imageinfo = require('./imageinfo');

var _imageinfo2 = _interopRequireDefault(_imageinfo);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var imageTypes = ['png', 'jpg', 'jpeg', 'gif'];

var getPiece = function getPiece(item, slice, sign) {
  sign = sign || "";
  var splits = item.split(sign),
      length = splits.length;
  return splits[length - slice];
};

var backslashToSlash = function backslashToSlash(item) {
  return item.replace(/\\/g, '\/');
};

var isImage = function isImage(filename) {
  var ext = filename.split('.').pop();
  return _underscore2.default.include(imageTypes, ext);
};

var isPathExist = function isPathExist(path) {
  if (!path) return false;
  return _fs2.default.existsSync(path);
};

var walkFiles = function walkFiles(params) {
  if (!params || !_underscore2.default.isObject(params)) return;

  var imagesData = [];
  var baseName = params.baseName;
  var tConnector = params.connector;
  var tMargin = params.tMargin;
  var sourceDir = params.sourceDir || false;
  var isSourceDirExist = isPathExist(sourceDir);

  (_underscore2.default.isUndefined(sourceDir) || _underscore2.default.isEmpty(sourceDir) || !sourceDir) && throwError('noSourceDir', 'throw');

  !isSourceDirExist && throwError('noSourceDir', 'throw');

  var walkDir = function walkDir(DIRPATH, DIRNAME) {
    if (!DIRPATH || !DIRNAME) return false;

    var walkedFiles = _fs2.default.readdirSync(DIRPATH);
    var filesData = {
      dirName: DIRNAME,
      dirPath: DIRPATH,
      files: []
    };

    _underscore2.default.isEmpty(walkedFiles) && throwError('noImages');

    if (!_underscore2.default.isEmpty(walkedFiles)) {

      walkedFiles.forEach(function (item) {

        var filePath = _path2.default.join(DIRPATH, item);
        var fileState = _fs2.default.lstatSync(filePath);
        var isFile = fileState.isFile();
        var isImg = isFile && isImage(item);
        var isDir = fileState.isDirectory();

        if (isFile && isImg) {
          var imgBuffer = _fs2.default.readFileSync(filePath);
          var imageInfo = (0, _imageinfo2.default)(imgBuffer);

          var imgData = {
            item: item,
            imgPath: filePath,
            imgBuffer: imgBuffer,
            imgName: item.split('.').shift().replace(/\s/g, ''),
            width: imageInfo.width,
            height: imageInfo.height + tMargin,
            format: imageInfo.format
          };
          filesData.files.push(imgData);
        }

        if (isDir) {
          var subBaseName = _path2.default.basename(filePath);
          subBaseName && walkDir(filePath, subBaseName);
        }
      });

      imagesData.push(filesData);
    }
  };

  walkDir(sourceDir, baseName);

  return imagesData;
};

var throwError = function throwError(errorType, action) {
  var errors = {
    default: 'There\'s an error',
    noSourceDir: 'The source dir is missing or could not be found',
    noImages: 'no images in the source directory',
    noLayout: 'There\'s something wrong with sprite layout',
    noConfig: 'Config is missing',
    noCsspath: 'Csspath is not valid',
    noImgpath: 'Imgpath is not valid',
    invalidRetina: 'Retina value is not valid and will be ingored',
    cssTplProblem: 'There\'s something wrong with generating css template'
  };

  var consColor = {
    warn: '\x1b[33m%s\x1b[0m'
  };

  var errMsg = errorType && _underscore2.default.includes(Object.keys(errors), errorType) ? errors[errorType] : errors.default;

  var takeAction = _underscore2.default.isUndefined(action) || !action ? 'warn' : action;

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
};

var capitalize = function capitalize(words) {
  if (!_underscore2.default.isArray(words) || _underscore2.default.isEmpty(words)) return false;

  var cap = function cap(word) {
    return word.charAt(0).toUpperCase() + word.substring(1).toLowerCase();
  };

  return words.map(function (item) {
    return cap(item);
  }).join('');
};

var formatWords = function formatWords(words, method) {
  if (!_underscore2.default.isArray(words) || _underscore2.default.isEmpty(words)) return false;

  var methods = ['-', '_', 'capitalize', ''];
  var tDefault = methods[0];
  var tMethod = _underscore2.default.some(methods, function (item) {
    return item === method;
  }) ? method : tDefault;

  var transWords = function transWords(sign) {
    return words.map(function (item) {
      return item.toLowerCase();
    }).join(sign);
  };

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
};

var isInteger = function isInteger(number) {
  if (!number || !_underscore2.default.isNumber(number)) return;

  return number % 1 === 0;
};

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

  isInteger: isInteger

};