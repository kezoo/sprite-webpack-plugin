'use strict';

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _mustache = require('mustache');

var _mustache2 = _interopRequireDefault(_mustache);

var _cssesc = require('cssesc');

var _cssesc2 = _interopRequireDefault(_cssesc);

var _util = require('../utils/util');

var _underscore = require('../utils/underscore');

var _underscore2 = _interopRequireDefault(_underscore);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var tmplPathFn = function tmplPathFn(processor, templatePath) {
  var tmplPath = __dirname + '/' + processor + '.mustache';
  if (!_underscore2.default.isUndefined(templatePath) && !_underscore2.default.isEmpty(templatePath) && _underscore2.default.isString(templatePath) && (0, _util.isPathExist)(templatePath)) {
    tmplPath = templatePath;
  }

  return _fs2.default.readFileSync(tmplPath, 'utf8');
};

var cssTemplate = function cssTemplate(params) {
  // console.log('params: ', params)
  var cssItems = params.items;
  var anotherCssItems = params.sprites;
  var spritesheet = params.spritesheet;
  var imgX = spritesheet.width;
  var imgY = spritesheet.height;
  var options = params.options;
  var clsNamePrefix = options.cssClass;
  var wEnlarge = options.enlarge;
  var template = {
    items: null,
    enlarge: wEnlarge,
    imgUrl: null
  };
  var enlargedImgData = null;
  var spriteImgData = options.base64Data;
  var tImgName = options.imgName;
  var lastIndexDot = tImgName.lastIndexOf('.');
  var nameWithoutExt = tImgName.slice(0, lastIndexDot);
  var tImgNameEnlarged = nameWithoutExt + '@2x' + tImgName.slice(lastIndexDot);
  var tEnlargeX = null;
  var tEnlargeY = null;

  template.items = cssItems.map(function (item) {
    item.image = item.image.replace(/\\/g, '\/');
    item.escaped_image = item.escaped_image.replace(/\\/g, '\/');
    item.name = (0, _util.formatWords)([clsNamePrefix, item.name], options.connector);
    item['class'] = '.' + (0, _cssesc2.default)(item.name, { isIdentifier: true });
    if (wEnlarge) {
      var insertIndex = item.escaped_image.lastIndexOf('.');

      if (options.reqBase64) {
        spriteImgData.forEach(function (item) {
          if (item.imgName.toLowerCase() === tImgNameEnlarged.toLowerCase()) {
            enlargedImgData = item.base64;
          }
        });
      }

      if (!options.reqBase64 && insertIndex > 0) {
        enlargedImgData = item.escaped_image.slice(0, insertIndex) + '@' + wEnlarge + 'x' + item.escaped_image.slice(insertIndex);
      }

      item['enlargedImage'] = enlargedImgData;
      item['enlargedX'] = Math.floor(imgX / wEnlarge);
      item['enlargedY'] = Math.floor(imgY / wEnlarge);
      item.px['enlargedX'] = item['enlargedX'] + 'px';
      item.px['enlargedY'] = item['enlargedY'] + 'px';

      tEnlargeX = item.px['enlargedX'];
      tEnlargeY = item.px['enlargedY'];
    }
    template.imgUrl = item.escaped_image;
    template.imgHdUrl = enlargedImgData;
    template.imgName = nameWithoutExt;
    template.nameClass = '.' + nameWithoutExt;
    template.enlargedX = tEnlargeX;
    template.enlargedY = tEnlargeY;
    return item;
  });

  var tmplFile = tmplPathFn(options.processor, options.templatePath);
  var css = _mustache2.default.render(tmplFile, template);
  return css;
};

module.exports = cssTemplate;