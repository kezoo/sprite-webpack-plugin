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

var opt = require('../config');
if (opt.opacity === 0 && opt.format === 'jpg') {opt.opacity = 1;}
var color = new Color(opt.background);
opt.color = color.rgbArray();
opt.color.push(opt.opacity);

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

function handleMultiDir(path) {
  var imagesList = [], images = {};
  var excludes = ['.DS_Store'];
  var files = Util.walk(path);
  _.forIn(files, function(subDir, baseName) {
    var baseName = baseName, list = [];
    if (baseName === "sprites") baseName = "base";
    subDir.forEach(function(value, key) {
      var path = value.path, filename = value.file;
      baseDir = path.substr(path.indexOf('sprites'));
      if (!_.include(excludes, filename)) {
        var file = path + filename;
        var name = Util.getPiece(filename, 2, '.')
        images = {
          list: list,
          file: file,
          baseName: baseName,
          name: name,
          baseDir: baseDir,
          dirPath: path
        }
        collectImages(images)
      }
    })
    imagesList.push(list)
  });
  return imagesList
}

function getImages(opt) {//use options
  var _path = opt.source;
  var imagesList = [], images = {};
  if (opt.multiFolders) { 
    return handleMultiDir(_path)
  }
  var files = _.filter(fs.readdirSync(_path), function(file) { 
    if (Util.isImage(file)) { return file; } 
  });
  files = Util.deleteDir(files, _path)
  files.forEach(function(file) {
    var dir = _path + file
    var name = Util.getPiece(file, 2, '.')
    images = {
      list: imagesList,
      file: dir,
      name: name,
      baseName: 'base',
      baseDir: "sprites",
      dirPath: _path
    }
    collectImages(images)
  });
  return imagesList;
}

function updateLayer(opt) {//use options
  var layoutOrientation =
      opt.orientation === 'vertical' ? 'top-down' :
      opt.orientation === 'horizontal' ? 'left-right' :
      'binary-tree';

  function appendLayer(list, layer) {
    _.forEach(list, function(image) {//use options
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

  if (opt.multiFolders) {
    var imagesList = getImages(opt);
    var lists = [];
    imagesList.forEach(function(value, key) {
      lists[key] = layout(layoutOrientation);
      appendLayer(value, lists[key])
      lists[key] = lists[key].export()
    })
    return lists;
  }

  var layer = layout(layoutOrientation);
  appendLayer(getImages(opt), layer)
  return layer.export();
}

function getStyles(opt) {//use options
  if (!opt.info) {
    opt.info = updateLayer(opt);//use options
  }
  function cssTemplate(list) {
    var stylePath = path.relative(opt.cssPath, opt.imgPath);
    var styles = [];
    _.forEach(list, function(item) {
      styles.push({
        'name':   item.meta.name,
        'x':      item.x,
        'y':      item.y,
        'width':  item.width,
        'height': item.height
      });
    });
    return templater({
      sprites: styles,
      spritesheet: {
        width: opt.info.width,
        height: opt.info.height,
        image: path.join(stylePath, opt.spriteName + "." + opt.format)
      }},{ format: opt.processor }
    );
  }

  function multiTemplates() {
    var templates=[], cssPath, imgPath;
    opt.info.forEach(function(sprites, key) {
      var width = sprites.width, height = sprites.height;
      var stylePath, styleName, spritesData = [];
      _.forEach(sprites.items, function(item) {
        cssPath = opt.cssPath + item.meta.baseDir;
        imgPath = opt.imgPath + item.meta.baseDir;
        stylePath = path.relative(cssPath, imgPath);
        styleName = item.meta.baseName;
        spritesData.push({
          'name':   item.meta.name,
          'x':      item.x,
          'y':      item.y,
          'width':  item.width,
          'height': item.height,
        });
      });
      var template = templater({
        sprites: spritesData,
        spritesheet: {
          width: width,
          height: height,
          image: path.join(stylePath, 'sprite-' + styleName + "." + opt.format)
        }},
        { format: opt.processor }
      );
      templates.push({
        name: 'sprite-' + styleName,
        template: template,
        cssPath: cssPath
      })
      spritesData = []
    });
    return templates
  }

  if (opt.multiFolders) { return multiTemplates(); }
  return cssTemplate(opt.info.items);
}

function createImagesInfo(info) {
  var imagesInfo = [], spriteName, imgPath;
  info.forEach(function(sprites, key) {
    _.forEach(sprites.items, function(item) {
      spriteName = item.meta.baseName;
      imgPath = opt.imgPath + item.meta.baseDir;
    });
    imagesInfo.push({
      info: sprites,
      spriteName: 'sprite-' + spriteName,
      imgPath: imgPath
    });
  });
  return imagesInfo;
}

module.exports = {
  options: opt,
  createStyles: function(opt) { //use options
    if (!Util.checkSource(opt.source)) { return }
    var content = getStyles(opt); //use options
    function create(cssPath, name, cssTpl) {
      Util.checkDir(cssPath, function() {
        var path = cssPath + name + '.' + opt.processor;
        fs.writeFile(path, cssTpl, function(err) {
          if (err) return console.log(err)
        })
      })
    }
    if (opt.multiFolders) {
      content.forEach(function(item) {
        create(item.cssPath, item.name, item.template);
      });
      return;
    }
    create(opt.cssPath, opt.spriteName, content);
  },
  createImage: function(opt) { //use options
    if (!Util.checkSource(opt.source)) { return }
    if (!opt.info) { opt.info = updateLayer(opt); } //use options
    function create(meta) {
      async.waterfall([
        function(next) {
          lwip.create (
            meta.info.width + 200,
            meta.info.height,
            opt.color,
            next
          )
        },
        function(image, next) {
          async.eachSeries(meta.info.items, function(item, callback) {
            lwip.open(item.meta.path, function(err, img) {
              image.paste(item.x, item.y, img, function(err, image){
                image.writeFile(meta.imgPath + meta.spriteName + '.' + opt.format, function(err, file) {
                    callback(null, image)
                });
              });
            });
          });
        }
      ], function(err) {
        if (err) return console.log(err);
      });
    }
    if (opt.multiFolders) {
      var imagesInfo = createImagesInfo(opt.info);
      imagesInfo.forEach(function(imgInfo) {
        Util.checkDir(imgInfo.imgPath)
        create(imgInfo)
      });
      return;
    }
    Util.checkDir(opt.imgPath);
    create(opt);
  }
}
