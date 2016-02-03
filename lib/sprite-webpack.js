var fs = require('fs');
var imageinfo = require('imageinfo');
var lwip = require('lwip');
var path = require('path');
var _ = require('lodash');
var templater = require('spritesheet-templates');
var async = require('async');
var Color = require('color');
var layout = require('layout');
var Util = require('./util');
var opts = require('../config');

templater.addTemplate('sprite', require(path.join(__dirname, 'templates/sprite.js')));

function collectImages(images) {
  var imageTypes = ['png', 'jpg', 'jpeg', 'gif'];
  var buffer = fs.readFileSync(images.file);
  var imageMeta = imageinfo(buffer);
  if (!imageMeta.format) return;
  var format = imageMeta.format.toLowerCase();
  if (_.includes(imageTypes, format)) {
    images.list.push({
      name: images.name,
      baseName: images.baseName,
      baseDir: images.baseDir,
      path: images.file,
      dirPath: images.dirPath,
      width: imageMeta.width,
      height: imageMeta.height,
      buffer: buffer
    });
  }
}

function getImages() {
  var imagesList = [], images = {};
  var excludes = ['.DS_Store'];
  var files = Util.walk(opts.source);
  var sourceReg = new RegExp(encodeURI(opts.source));
  var slashIndicator = null;
  _.forIn(files, function(subDir, baseName) {
    var baseName = baseName, list = [];
    if (baseName === Util.BaseDirName) baseName = opts.baseName;
    subDir.forEach(function(value, key) {
      var _path = value.path, filename = value.file;
      var baseDirName = decodeURI(encodeURI(_path).replace(sourceReg, ''));
      if (_.isEmpty(baseDirName)) {
        baseDirName = opts.baseName;
      }
      if (_.includes(baseDirName, '\\')) {
        slashIndicator = '\\';
      }
      if (_.includes(baseDirName, '\/')) {
        slashIndicator = '\/';
      }
      if (_.includes(baseDirName, slashIndicator)) {
        baseDirName = baseDirName.split(slashIndicator).join(opts.connector);
        if (baseDirName.indexOf(opts.connector) === 0) {
          var reg = new RegExp(opts.connector);
          baseDirName = baseDirName.replace(reg, '');
        }
      }
      if (!_.includes(excludes, filename)) {
        var file = path.join(_path, filename);
        var name = Util.getPiece(filename, 2, '.');
        images = {
          list: list,
          file: file,
          baseName: baseName,
          name: name,
          baseDir: baseDirName,
          dirPath: _path
        };
        collectImages(images);
      }
    });
    imagesList.push(list);
  });
  return imagesList;
}

function updateLayer() {
  var layoutOrientation =
      opts.orientation === 'vertical' ? 'top-down' :
      opts.orientation === 'horizontal' ? 'left-right' :
      'binary-tree';

  function appendLayer(list, layer) {
    _.forEach(list, function(image) {
      layer.addItem({
        'height': image.height,
        'width': image.width,
        'meta': {
          buffer: image.buffer,
          path: image.path,
          baseDir: image.baseDir,
          baseName: image.baseName,
          dirPath: image.dirPath,
          name: image.name
        }
      });
    });
  }
  var images = getImages(opts);
  var singleList = [], multiLists = [];
  images.forEach(function(value, key) {
    singleList = singleList.concat(value);
    multiLists[key] = layout(layoutOrientation);
    appendLayer(value, multiLists[key]);
    multiLists[key] = multiLists[key].export();
  });
  var singleLayer = layout(layoutOrientation);
  appendLayer(singleList, singleLayer);
  switch (opts.bundleMode) {
    case opts.oneBundle:
      return singleLayer.export();
      break;
    case opts.multipleBundle:
      return multiLists;
    default:
      return singleLayer.export();
  }
}

function duplicateClassname(namesArray, name, newName) {
  if (_.includes(namesArray, name)) {
    return newName;
  } else {
    namesArray.push(name);
    return name;
  }
}

function getStyles() {
  if (!opts.info) { opts.info = updateLayer(); }
  var classnames = [];
  function cssTemplate(list) {
    var stylePath = path.relative(opts.cssPath, opts.imgPath);
    var styles = [];
    _.forEach(list, function(item) {
      var classname = item.meta.name;
      var newClassName = item.meta.baseDir + opts.connector + item.meta.name;
      var name = duplicateClassname(classnames, classname, newClassName);
      styles.push({
        'name':   name,
        'x':      item.x,
        'y':      item.y,
        'width':  item.width,
        'height': item.height
      });
    });
    return templater({
      sprites: styles,
      spritesheet: {
        width: opts.info.width,
        height: opts.info.height,
        image: path.join(stylePath, opts.spriteName + opts.connector + opts.baseName + "." + opts.format)
      }}, {
        format: 'sprite',
        formatOpts: {
          'cssClass': opts.prefix,
          'connector': opts.connector,
          'processor': opts.processor,
          'templatePath': opts.templatePath
        }
      }
    );
  }

  function multiTemplates() {
    var templates=[], cssPath, imgPath;
    opts.info.forEach(function(sprites, key) {
      var width = sprites.width, height = sprites.height;
      var stylePath, styleName, spritesData = [];
      _.forEach(sprites.items, function(item) {
        cssPath = path.join(opts.cssPath);
        imgPath = path.join(opts.imgPath);
        stylePath = path.relative(cssPath, imgPath);
        styleName = item.meta.baseDir;
        var classname = item.meta.name;
        var newClassName = item.meta.baseDir + opts.connector + item.meta.name;
        var name = duplicateClassname(classnames, classname, newClassName);
        spritesData.push({
          'name':   name,
          'x':      item.x,
          'y':      item.y,
          'width':  item.width,
          'height': item.height,
        });
      });
      if (opts.useImport) {
        var _cssPath = opts.cssPath;
        stylePath = path.relative(_cssPath, imgPath);
      }
      var template = templater({
        sprites: spritesData,
        spritesheet: {
          width: width,
          height: height,
          image: path.join(stylePath, opts.spriteName + opts.connector + styleName + "." + opts.format)
        }},{
          format: 'sprite',
          formatOpts: {
            'cssClass': opts.prefix,
            'connector': opts.connector,
            'processor': opts.processor
          }
        }
      );
      templates.push({
        name: opts.spriteName + opts.connector + styleName,
        template: template,
        cssPath: cssPath
      });
      spritesData = [];
    });
    return templates;
  }

  switch (opts.bundleMode) {
    case opts.oneBundle:
      return cssTemplate(opts.info.items);
      break;
    case opts.multipleBundle:
      return multiTemplates();
      break;
    default:
      return cssTemplate(opts.info.items);
  }
}

function createImagesInfo() {
  var info = opts.info;
  var imagesInfo = [], spriteName, imgPath;
  info.forEach(function(sprites, key) {
    _.forEach(sprites.items, function(item) {
      spriteName = item.meta.baseDir;
      imgPath = path.join(opts.imgPath);
    });
    imagesInfo.push({
      info: sprites,
      spriteName: opts.spriteName + opts.connector + spriteName,
      imgPath: imgPath
    });
  });
  return imagesInfo;
}

function initOpts(options) {
  if (options.opacity === 0 && options.format === 'jpg') {
    options.opacity = 1;
  }
  var color = new Color(options.background);
  options.color = color.rgbArray();
  options.color.push(options.opacity);
  opts.hasInit = true;
  opts.oneBundle = 'one';
  opts.multipleBundle = 'multiple';
  if (opts.bundleMode !== opts.oneBundle && opts.bundleMode !== opts.multipleBundle) {
    opts.bundleMode = opts.oneBundle
  }
  opts = _.assign({}, opts, options);
  switch(opts.connector) {
    case 'dash':
      opts.connector = '-';
      break;
    case 'underline':
      opts.connector = '_';
      break;
    default:
      opts.connector = '-';
  }
}

module.exports = {
  options: opts,

  createStyles: function(options) {
    if (!opts.hasInit) initOpts(options);
    if (!Util.checkSource(opts.source)) { return; }
    var content = getStyles();
    function create(cssPath, cssName, cssTpl) {
      Util.checkDir(cssPath, function() {
        if (opts.processor == 'stylus') {
          opts.processor = 'styl';
        }
        var _path = path.join(cssPath, cssName + '.' + opts.processor);
        fs.writeFile(_path, cssTpl, function(err) {
          if (err) return console.log(err);
        });
      });
    }
    var cssTpl = content;
    var cssPath = path.join(opts.cssPath);
    var cssName = opts.spriteName + opts.connector + opts.baseName;
    switch (opts.bundleMode) {
      case opts.oneBundle:
        return create(cssPath, cssName, cssTpl);
        break;
      case opts.multipleBundle:
        content.forEach(function(item) {
          create(item.cssPath, item.name, item.template);
        });
        break;
      default:
        return create(cssPath, cssName, cssTpl);
    }
  },

  createImage: function(options) {
    if (!opts.hasInit) initOpts(options);
    if (!Util.checkSource(opts.source)) { return; }
    if (!opts.info) { opts.info = updateLayer(); }
    function create(meta) {
      async.waterfall([
        function(next) {
          lwip.create (
            meta.info.width,
            meta.info.height,
            opts.color,
            next
          );
        },
        function(image, next) {
          async.eachSeries(meta.info.items, function(item, callback) {
            lwip.open(item.meta.path, function(err, img) {
              image.paste(item.x, item.y, img, function(err, image){
                image.writeFile(path.join(meta.imgPath, meta.spriteName + '.' + opts.format), function(err, file) {
                  callback(null, image);
                });
              });
            });
          });
        }
      ], function(err) {
        if (err) return console.log(err);
      });
    }

    function createOne() {
      Util.checkDir(opts.imgPath);
      opts.spriteName = opts.spriteName + opts.connector + opts.baseName;
      return create(opts);
    }
    switch (opts.bundleMode) {
      case opts.oneBundle:
        createOne();
        break;
      case opts.multipleBundle:
        var imagesInfo = createImagesInfo();
        imagesInfo.forEach(function(imgInfo) {
          Util.checkDir(imgInfo.imgPath);
          create(imgInfo);
        });
        break;
      default:
        createOne();
        return create(opts);
    }
  },

  addImport: function(options) {
    if (!opts.hasInit) initOpts(options);
    if (opts.bundleMode === opts.oneBundle) return;
    if (!opts.useImport) return;
    if (!Util.checkSource(opts.source)) { return; }
    if (!opts.info) { opts.info = updateLayer(opts); }
    var content = getStyles();
    var spriteIndex = path.join(opts.cssPath, opts.spriteName + opts.connector + opts.indexName + '.' + opts.processor);
    try {
      stats = fs.lstatSync(spriteIndex);
    }
    catch (e) {
      fs.writeFileSync(spriteIndex);
    }
    fs.truncateSync(spriteIndex);
    _.forIn(content, function(v, i) {
      var importPath = path.relative(opts.cssPath, v.cssPath);
      fs.appendFileSync(
        spriteIndex,
        '@import "./' + path.join(importPath, v.name) + '";\n'
      );
    });
  }
};
