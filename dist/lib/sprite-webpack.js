'use strict';

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _spritesheetTemplates = require('spritesheet-templates');

var _spritesheetTemplates2 = _interopRequireDefault(_spritesheetTemplates);

var _async = require('async');

var _async2 = _interopRequireDefault(_async);

var _lwip = require('lwip');

var _lwip2 = _interopRequireDefault(_lwip);

var _imageinfo = require('./utils/imageinfo');

var _imageinfo2 = _interopRequireDefault(_imageinfo);

var _util = require('./utils/util');

var _util2 = _interopRequireDefault(_util);

var _layout = require('./utils/layout/');

var _layout2 = _interopRequireDefault(_layout);

var _color = require('./utils/color/');

var _color2 = _interopRequireDefault(_color);

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

var _underscore = require('./utils/underscore');

var _underscore2 = _interopRequireDefault(_underscore);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var opts = _underscore2.default.clone(_config2.default);

var imageTypes = _util2.default.imageTypes;

_spritesheetTemplates2.default.addTemplate('sprite', require(_path2.default.join(__dirname, 'templates/sprite.js')));

var checkWeirdo = function checkWeirdo(checks, value) {

  if (!checks || !_underscore2.default.isArray(checks)) return false;

  var checkList = {
    undefined: _underscore2.default.isUndefined,
    null: _underscore2.default.isNull,
    empty: _underscore2.default.isEmpty,
    object: _underscore2.default.isObject,
    array: _underscore2.default.isArray,
    string: _underscore2.default.isString,
    number: _underscore2.default.isNumber
  };

  var needChecks = _underscore2.default.intersection(checks, Object.keys(checkList));

  if (_underscore2.default.isEmpty(needChecks)) return true;

  var falseLen = needChecks.length;
  var tFunc = null;
  var tResult = null;

  needChecks.forEach(function (item) {
    tFunc = checkList[item];

    if (tFunc) {

      tResult = tFunc(value);

      if (item === 'undefined' || item === 'null' || item === 'empty') {
        tResult = !tResult;
      }

      if (tResult) {
        falseLen -= 1;
      }
    }
  });

  return falseLen === 0;
};

var matchedLen = function matchedLen(list, identify) {
  if (!list || !identify) return false;

  var len = 0;
  var reg = new RegExp(identify, 'i');
  list.forEach(function (item) {
    if (reg.test(item.toLowerCase())) {
      len += 1;
    }
  });
  return len;
};

/*
Any detected duplicate name will be: name + 1
 */
var handleDupeName = function handleDupeName(imgData) {
  if (!imgData || !_underscore2.default.isArray(imgData) || _underscore2.default.isEmpty(imgData)) return false;

  var names = [];
  var itemFiles = null;
  var tName = null;

  _underscore2.default.map(imgData, function (item) {
    itemFiles = item.files;
    names = [];

    if (_underscore2.default.isUndefined(itemFiles) || !_underscore2.default.isArray(itemFiles) || _underscore2.default.isEmpty(itemFiles)) return;

    itemFiles.forEach(function (img) {
      tName = img.imgName;
      if (_underscore2.default.includes(names, tName)) {
        var mLen = matchedLen(names, tName) + 1;
        if (mLen !== false) {
          img.imgName = tName + mLen;
        }
      }

      names.push(img.imgName);
    });

    return item;
  });
};

var initConfig = function initConfig(config) {
  (_underscore2.default.isUndefined(config) || !_underscore2.default.isObject(config)) && _util2.default.throwError('noConfig', 'throw');

  if (!checkWeirdo(['undefined', 'null', 'empty'], config.prefix)) {
    config.prefix = _config2.default.prefix;
  }

  if (!checkWeirdo(['undefined', 'null', 'empty'], config.baseName)) {
    config.baseName = _config2.default.baseName;
  }

  if (!checkWeirdo(['undefined', 'null', 'empty'], config.spriteName)) {
    config.spriteName = _config2.default.spriteName;
  }

  if (checkWeirdo(['undefined', 'null', 'empty', 'string'], config.source)) {
    config.source = _path2.default.normalize(config.source);
  }

  if (checkWeirdo(['undefined', 'null', 'empty', 'string'], config.cssPath)) {
    config.cssPath = _path2.default.normalize(config.cssPath);
  } else {
    _util2.default.throwError('noCsspath', 'throw');
  }

  if (checkWeirdo(['undefined', 'null', 'empty', 'string'], config.imgPath)) {
    config.imgPath = _path2.default.normalize(config.imgPath);
  } else {
    _util2.default.throwError('noImgpath', 'throw');
  }

  if (checkWeirdo(['undefined', 'null', 'number'], config.enlarge)) {

    if (config.enlarge <= 1 || config.enlarge > 3) {
      config.enlarge = null;
      _util2.default.throwError('invalidRetina');
    } else {

      if (!config.isBundled) {}
    }
  } else {
    config.enlarge = null;
    _util2.default.throwError('invalidRetina');
  }

  if (checkWeirdo(['undefined', 'null', 'number'], config.margin)) {
    if (config.margin < 2 || config.margin > 10) {
      config.margin = _config2.default.margin;
    }
  } else {
    config.margin = _config2.default.margin;
  }

  if (config.processor == 'stylus') {
    config.processor = 'styl';
  }

  if (config.opacity !== 1 && config.format === 'jpg') {
    config.opacity = 1;
  }

  var color = new _color2.default(config.background);
  config.color = color.rgbArray();
  config.color.push(config.opacity);

  opts = _underscore2.default.assign({}, opts, config);
};

/*
Name: getImagesData
@function
@params: none
@returns: {Array of object}
@example:
[
  {
    dirname: '', // String, directory name
    dirPath: '', // String, directory path
    files: [  // Array of objects
      {
        item: '', // String, image name with its extension
        imgPath: '', // String, image path
        imgBuffer: Object // Buffer Object, Node.js image buffer
        imgName: '', // String, image name
        width: 0, // Number, image width
        height: 0, // Number, image height
        format: '', // String, image format,
      }
    ]
  },
  ...
]
*/
var getImagesData = function getImagesData() {
  var paramsWalk = {
    sourceDir: opts.source,
    baseName: _path2.default.normalize(opts.baseName),
    connector: opts.connector,
    tMargin: opts.margin
  };

  var imagesData = _util2.default.walkFiles(paramsWalk) || [];

  (_underscore2.default.isUndefined(imagesData) || _underscore2.default.isEmpty(imagesData)) && _util2.default.throwError('noImages');

  var isBundled = opts.isBundled;
  var baseAsEmpty = {
    dirName: opts.baseName,
    dirPath: _path2.default.normalize(opts.source),
    files: []
  };

  if (isBundled && !_underscore2.default.isEmpty(imagesData) && imagesData.length > 1) {

    var baseDirItems = imagesData.filter(function (item) {
      return item.dirName === opts.baseName;
    });

    baseDirItems = _underscore2.default.isEmpty(baseDirItems) ? baseAsEmpty : baseDirItems[0];

    imagesData.forEach(function (item) {
      if (item.dirName === opts.baseName) return;
      baseDirItems.files = Array.prototype.concat(baseDirItems.files, item.files);
    });

    imagesData = [];
    imagesData.push(baseDirItems);
  }

  /*
  imagesData: {array}
  What it's:
    contains how many items,
    then outputs them all,
    no matter how it's been bundled
   */
  _underscore2.default.filter(imagesData, function (item) {
    return !_underscore2.default.isEmpty(item.files);
  });
  if (handleDupeName(imagesData)) {
    imagesData = handleDupeName(imagesData);
  }

  return imagesData;
};

var spritesLayout = function spritesLayout() {
  var layoutOrientation = opts.orientation === 'vertical' ? 'top-down' : opts.orientation === 'horizontal' ? 'left-right' : 'binary-tree';

  var imagesData = getImagesData();

  if (_underscore2.default.isUndefined(imagesData) || !_underscore2.default.isArray(imagesData) || _underscore2.default.isEmpty(imagesData)) {
    return _util2.default.throwError('noImages');
  }

  var layoutItems = [];
  var tLayout = null;

  imagesData.forEach(function (item, itemKey) {

    tLayout = (0, _layout2.default)(layoutOrientation);

    item.files.forEach(function (imgItem) {

      tLayout.addItem({
        width: imgItem.width,
        height: imgItem.height,
        extra: imgItem
      });
    });

    layoutItems[itemKey] = tLayout.export();
    layoutItems[itemKey].dirName = item.dirName;
    layoutItems[itemKey].dirPath = item.dirPath;
    layoutItems[itemKey].enlarge = opts.enlarge;
    layoutItems[itemKey].tName = _util2.default.formatWords([opts.spriteName, item.dirName], opts.connector);
    layoutItems[itemKey].imgName = layoutItems[itemKey].tName + '.' + opts.format;
    layoutItems[itemKey].cssName = layoutItems[itemKey].tName + '.' + opts.processor;

    layoutItems[itemKey].width += opts.margin * 2;
    layoutItems[itemKey].height += opts.margin;
  });
  // console.log(layoutItems)
  return layoutItems;
};

var transformStyles = function transformStyles() {

  var layouts = spritesLayout();

  if (_underscore2.default.isUndefined(layouts) || !_underscore2.default.isArray(layouts) || _underscore2.default.isEmpty(layouts)) {
    return _util2.default.throwError('noLayout');
  }

  var templateList = [];
  var tmplSample = function tmplSample(props) {
    return {
      name: props.name,
      template: props.tmpl,
      cssPath: props.cssPath
    };
  };
  var styleSample = function styleSample(props) {
    return (0, _spritesheetTemplates2.default)({
      sprites: props.sprites,
      spritesheet: {
        width: props.width,
        height: props.height,
        image: props.imagePath
      } }, {
      format: 'sprite',
      formatOpts: {
        'cssClass': props.prefix,
        'connector': props.connector,
        'processor': props.processor,
        'templatePath': props.templatePath,
        'enlarge': props.enlarge
      }
    });
  };
  var propsTmpl = {
    name: null,
    tmpl: null,
    cssPath: null
  };
  var propsStyle = {
    sprites: null,
    width: null,
    height: null,
    imagePath: null,
    prefix: null,
    connector: null,
    processor: null
  };
  var tmpl = void 0;
  var stylePath = void 0;
  var imgName = void 0;
  var imgPath = void 0;

  layouts.forEach(function (layout) {

    if (_underscore2.default.isEmpty(layout.items)) return;

    stylePath = _path2.default.relative(opts.cssPath, opts.imgPath);

    if (!_underscore2.default.isNull(opts.fixedStylePath) && !_underscore2.default.isEmpty(opts.fixedStylePath)) {
      stylePath = opts.fixedStylePath;
    }

    imgName = _util2.default.formatWords([opts.spriteName, layout.dirName], opts.connector);
    imgName = imgName + '.' + opts.format;
    imgPath = _path2.default.join(stylePath, imgName);

    propsStyle.sprites = [];
    propsStyle.width = layout.width;
    propsStyle.height = layout.height;
    propsStyle.imagePath = imgPath;
    propsStyle.prefix = opts.prefix;
    propsStyle.connector = opts.connector;
    propsStyle.processor = opts.processor;
    propsStyle.templatePath = opts.templatePath;
    propsStyle.enlarge = opts.enlarge ? opts.enlarge : false;
    // console.log(layout.items)
    layout.items.forEach(function (imgItem, imgItemKey) {

      if (propsStyle.enlarge) {
        imgItem.x = Math.ceil(imgItem.x / propsStyle.enlarge);
        imgItem.y = Math.ceil(imgItem.y / propsStyle.enlarge);
        imgItem.width = Math.ceil(imgItem.width / propsStyle.enlarge);
        imgItem.height = Math.ceil(imgItem.height / propsStyle.enlarge);
      }

      imgItem.x += Math.floor(opts.margin / (propsStyle.enlarge || 1));
      imgItem.y += Math.floor(opts.margin / (propsStyle.enlarge || 1));
      imgItem.height -= Math.floor(opts.margin / (propsStyle.enlarge || 1));

      propsStyle.sprites.push({
        'name': imgItem.extra.imgName,
        'x': imgItem.x,
        'y': imgItem.y,
        'width': imgItem.width,
        'height': imgItem.height
      });
    });
    // console.log('propsStyle: ', propsStyle)
    propsTmpl.name = layout.dirName;
    propsTmpl.tmpl = styleSample(propsStyle);
    propsTmpl.cssPath = opts.cssPath;

    tmpl = tmplSample(propsTmpl);
    templateList.push(tmpl);
  });
  // console.log('templateList: ', templateList)
  return templateList;
};

var createCss = function createCss() {

  var cssTemplates = transformStyles();

  if (!_underscore2.default.isArray(cssTemplates) || _underscore2.default.isEmpty(cssTemplates)) {
    return _util2.default.throwError('cssTplProblem');
  }

  cssTemplates.forEach(function (item) {

    var tPath = _path2.default.join(item.cssPath, _util2.default.formatWords([opts.spriteName, item.name], opts.connector)) + '.' + opts.processor;

    _fs2.default.writeFile(tPath, item.template, function (err) {
      if (err) return console.log(err);
    });
  });
};

var createImg = function createImg() {

  var layouts = spritesLayout();

  if (_underscore2.default.isUndefined(layouts) || !_underscore2.default.isArray(layouts) || _underscore2.default.isEmpty(layouts)) {
    return _util2.default.throwError('noLayout');
  }

  layouts.forEach(function (layout) {

    var tEnlarge = layout.enlarge;
    var tItemX = void 0;
    var tItemY = void 0;
    _async2.default.waterfall([function (next) {
      _lwip2.default.create(layout.width, layout.height, opts.color, next);
    }, function (image, next) {
      _async2.default.eachSeries(layout.items, function (item, callback) {
        tItemX = item.x + opts.margin;
        tItemY = item.y + opts.margin;

        _lwip2.default.open(item.extra.imgPath, function (err, imgObj) {
          image.paste(tItemX, tItemY, imgObj, callback);
        });
      }, function () {
        next(null, image);
      });
    }, function (image, next) {
      var tName = layout.imgName;
      var lIndex = tName.lastIndexOf('.');
      var nameFix = tEnlarge ? tName.slice(0, lIndex) + ('@' + tEnlarge + 'x') + tName.slice(lIndex) : tName;
      var imgFinalPath = _path2.default.join(opts.imgPath, nameFix);

      if (tEnlarge) {
        var resizeW = layout.width / tEnlarge;
        var resizeY = layout.height / tEnlarge;
        var resizeImgPath = _path2.default.join(opts.imgPath, layout.imgName);

        image.clone(function (err, clone) {
          clone.resize(resizeW, resizeY, 'grid', function (err, image) {
            image.writeFile(resizeImgPath, function (err, file) {
              // console.log('ResizedImage has been created')
            });
          });
        });
      }

      image.writeFile(imgFinalPath, function (err, file) {
        // console.log('SpriteImage has been created')
      });
    }], function (err) {
      if (err) return console.log('waterfall ERR: ', err);
    });
  });
};

var create = function create() {

  createCss();
  createImg();
};

module.exports = {
  options: opts,

  addImport: function addImport(options) {
    if (!opts.hasInit) initOpts(options);
    if (opts.bundleMode === opts.oneBundle) return;
    if (!opts.useImport) return;
    if (!_util2.default.checkSource(opts.source)) {
      return;
    }
    if (!opts.info) {
      opts.info = updateLayer(opts);
    }
    var content = getStyles();
    var spriteIndex = _path2.default.join(opts.cssPath, opts.spriteName + opts.connector + opts.indexName + '.' + opts.processor);
    try {
      stats = _fs2.default.lstatSync(spriteIndex);
    } catch (e) {
      _fs2.default.writeFileSync(spriteIndex);
    }
    _fs2.default.truncateSync(spriteIndex);
    _underscore2.default.forIn(content, function (v, i) {
      var importPath = _path2.default.relative(opts.cssPath, v.cssPath);
      _fs2.default.appendFileSync(spriteIndex, '@import "./' + _path2.default.join(importPath, v.name) + '";\n');
    });
  },

  generate: function generate(config) {
    initConfig(config);
    // console.log(templater)
    // getImagesData();
    // spritesLayout();
    // transformStyles();
    create();
  }
};