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

  template.items = cssItems.map(function (item) {
    item.image = item.image.replace(/\\/g, '\/');
    item.escaped_image = item.escaped_image.replace(/\\/g, '\/');
    item.name = (0, _util.formatWords)([clsNamePrefix, item.name], options.connector);
    item['class'] = '.' + (0, _cssesc2.default)(item.name, { isIdentifier: true });
    if (wEnlarge) {
      var insertIndex = item.escaped_image.lastIndexOf('.');
      if (insertIndex > 0) {
        item['enlargedImage'] = item.escaped_image.slice(0, insertIndex) + '@' + wEnlarge + 'x' + item.escaped_image.slice(insertIndex);
      }
      item['enlargedX'] = Math.floor(imgX / wEnlarge);
      item['enlargedY'] = Math.floor(imgY / wEnlarge);
      item.px['enlargedX'] = item['enlargedX'] + 'px';
      item.px['enlargedY'] = item['enlargedY'] + 'px';
    }
    template.imgUrl = item.escaped_image;
    return item;
  });
  // console.log('template: ', template)
  var tmplFile = tmplPathFn(options.processor, options.templatePath);
  var css = _mustache2.default.render(tmplFile, template);
  return css;
};

module.exports = cssTemplate;