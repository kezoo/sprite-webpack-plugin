import fs from 'fs';
import path from 'path';

import templater from 'spritesheet-templates';
import async from 'async';
import lwip from 'lwip';

import imageinfo from './utils/imageinfo';
import Util from './utils/util';
import layout from './utils/layout/';
import Color from './utils/color/';
import tConfig from '../config';
import _ from './utils/underscore';

let opts = _.clone(tConfig);

const imageTypes = Util.imageTypes;

templater.addTemplate('sprite', require(path.join(__dirname, 'templates/sprite.js')));

const checkWeirdo = (checks, value) => {

  if (!checks || !_.isArray(checks)) return false;

  const checkList = {
    undefined: _.isUndefined,
    null: _.isNull,
    empty: _.isEmpty,
    object: _.isObject,
    array: _.isArray,
    string: _.isString,
    number: _.isNumber,
  };

  const needChecks = _.intersection(checks, Object.keys(checkList));

  if (_.isEmpty(needChecks)) return true;

  let falseLen = needChecks.length;
  let tFunc = null;
  let tResult = null;

  needChecks.forEach( (item) => {
    tFunc = checkList[item];

    if (tFunc) {

      tResult = tFunc(value);

      if (item === 'undefined' || item === 'null' || item === 'empty') {
        tResult = !tResult
      }

      if (tResult) {
        falseLen -= 1;
      }

    }
  });

  return falseLen === 0;
}

const matchedLen = (list, identify) => {
  if (!list || !identify) return false;

  var len = 0;
  var reg = new RegExp(identify, 'i');
  list.forEach( function (item) {
    if (reg.test(item.toLowerCase())) {
      len += 1;
    }
  });
  return len;
}

/*
Any detected duplicate name will be: name + 1
 */
const handleDupeName = (imgData) => {
  if (!imgData || !_.isArray(imgData) || _.isEmpty(imgData)) return false;

  let names = [];
  let itemFiles = null;
  let tName = null;

  _.map(imgData, (item) => {
    itemFiles = item.files;
    names = [];

    if (_.isUndefined(itemFiles) || !_.isArray(itemFiles) || _.isEmpty(itemFiles)) return;

    itemFiles.forEach( (img) => {
      tName = img.imgName;
      if (_.includes(names, tName)) {
        const mLen = matchedLen(names, tName) + 1;
        if (mLen !== false) {
          img.imgName = tName + mLen;
        }
      }

      names.push(img.imgName);
    })

    return item;
  })
}

const initConfig = (config) => {
  (_.isUndefined(config) || !_.isObject(config)) && Util.throwError('noConfig', 'throw');

  if (!checkWeirdo(['undefined', 'null', 'empty'], config.prefix)) {
    config.prefix = tConfig.prefix;
  }

  if (!checkWeirdo(['undefined', 'null', 'empty'], config.baseName)) {
    config.baseName = tConfig.baseName;
  }

  if (!checkWeirdo(['undefined', 'null', 'empty'], config.spriteName)) {
    config.spriteName = tConfig.spriteName;
  }

  if (checkWeirdo(['undefined', 'null', 'empty', 'string'], config.source)) {
    config.source = path.normalize(config.source);
  }

  if (checkWeirdo(['undefined', 'null', 'empty', 'string'], config.cssPath)) {
    config.cssPath = path.normalize(config.cssPath);
  }
  else {
    Util.throwError('noCsspath', 'throw')
  }

  if (checkWeirdo(['undefined', 'null', 'empty', 'string'], config.imgPath)) {
    config.imgPath = path.normalize(config.imgPath);
  }
  else {
    Util.throwError('noImgpath', 'throw')
  }

  if (checkWeirdo(['undefined', 'null', 'number'], config.enlarge)) {

    if (config.enlarge <= 1 || config.enlarge > 3) {
      config.enlarge = null;
      Util.throwError('invalidRetina');
    }
    else {

      if (!config.isBundled) {

      }
    }
  }
  else {
    config.enlarge = null;
    Util.throwError('invalidRetina');
  }

  if (checkWeirdo(['undefined', 'null', 'number'], config.margin)) {
    if (config.margin < 2 || config.margin > 10) {
      config.margin = tConfig.margin;
    }
  }
  else {
    config.margin = tConfig.margin;
  }

  if (config.processor == 'stylus') {
    config.processor = 'styl';
  }

  if (config.opacity !== 1 && config.format === 'jpg') {
    config.opacity = 1;
  }

  var color = new Color(config.background);
  config.color = color.rgbArray();
  config.color.push(config.opacity);

  opts = _.assign({}, opts, config);

}

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
const getImagesData = () => {
  const paramsWalk = {
    sourceDir: opts.source,
    baseName: path.normalize(opts.baseName),
    connector: opts.connector,
    tMargin: opts.margin,
  };

  let imagesData = Util.walkFiles(paramsWalk) || [];

  (_.isUndefined(imagesData) || _.isEmpty(imagesData)) && Util.throwError('noImages');

  const isBundled = opts.isBundled;
  const baseAsEmpty = {
    dirName: opts.baseName,
    dirPath: path.normalize(opts.source),
    files: [],
  }

  if (isBundled && !_.isEmpty(imagesData) && imagesData.length > 1) {

    let baseDirItems = imagesData.filter( (item) => item.dirName === opts.baseName);

    baseDirItems = _.isEmpty(baseDirItems) ? baseAsEmpty : baseDirItems[0];

    imagesData.forEach( (item) => {
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
  _.filter(imagesData, (item) => !_.isEmpty(item.files));
  if (handleDupeName(imagesData)) {
    imagesData = handleDupeName(imagesData);
  }

  return imagesData;
}

const spritesLayout = () => {
  var layoutOrientation =
      opts.orientation === 'vertical' ? 'top-down' :
      opts.orientation === 'horizontal' ? 'left-right' :
      'binary-tree';

  const imagesData = getImagesData();

  if (_.isUndefined(imagesData) || !_.isArray(imagesData) || _.isEmpty(imagesData)) {
    return Util.throwError('noImages');
  }

  let layoutItems = [];
  let tLayout = null;

  imagesData.forEach( (item, itemKey) => {

    tLayout = layout(layoutOrientation);

    item.files.forEach( (imgItem) => {

      tLayout.addItem({
        width: imgItem.width,
        height: imgItem.height,
        extra: imgItem,
      })

    });

    layoutItems[itemKey] = tLayout.export();
    layoutItems[itemKey].dirName = item.dirName;
    layoutItems[itemKey].dirPath = item.dirPath;
    layoutItems[itemKey].enlarge = opts.enlarge;
    layoutItems[itemKey].tName = Util.formatWords([opts.spriteName, item.dirName], opts.connector);
    layoutItems[itemKey].imgName = layoutItems[itemKey].tName + '.' + opts.format;
    layoutItems[itemKey].cssName = layoutItems[itemKey].tName + '.' + opts.processor;

    layoutItems[itemKey].width += opts.margin * 2;
    layoutItems[itemKey].height += opts.margin;

  })
  // console.log(layoutItems)
  return layoutItems;
}

const transformStyles = () => {

  const layouts = spritesLayout();

  if (_.isUndefined(layouts) || !_.isArray(layouts) || _.isEmpty(layouts)) {
    return Util.throwError('noLayout');
  }

  let templateList = [];
  let tmplSample = (props) => ({
    name: props.name,
    template: props.tmpl,
    cssPath: props.cssPath,
  });
  let styleSample = (props) => templater({
    sprites: props.sprites,
    spritesheet: {
      width: props.width,
      height: props.height,
      image: props.imagePath
    }}, {
      format: 'sprite',
      formatOpts: {
        'cssClass': props.prefix,
        'connector': props.connector,
        'processor': props.processor,
        'templatePath': props.templatePath,
        'enlarge': props.enlarge
      }
    }
  );
  let propsTmpl = {
    name: null,
    tmpl: null,
    cssPath: null,
  };
  let propsStyle = {
    sprites: null,
    width: null,
    height: null,
    imagePath: null,
    prefix: null,
    connector: null,
    processor: null,
  };
  let tmpl;
  let stylePath;
  let imgName;
  let imgPath;

  layouts.forEach( (layout) => {

    if (_.isEmpty(layout.items)) return;

    stylePath = path.relative(opts.cssPath, opts.imgPath);

    if (!_.isNull(opts.fixedStylePath) && !_.isEmpty(opts.fixedStylePath)) {
      stylePath = opts.fixedStylePath;
    }

    imgName = Util.formatWords([opts.spriteName, layout.dirName], opts.connector);
    imgName = `${imgName}.${opts.format}`;
    imgPath = path.join(stylePath, imgName);

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
    layout.items.forEach( (imgItem, imgItemKey) => {

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
        'name':   imgItem.extra.imgName,
        'x':      imgItem.x,
        'y':      imgItem.y,
        'width':  imgItem.width,
        'height': imgItem.height,
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
}

const createCss = () => {

  const cssTemplates = transformStyles();

  if (!_.isArray(cssTemplates) || _.isEmpty(cssTemplates)) {
    return Util.throwError('cssTplProblem');
  }

  cssTemplates.forEach( (item) => {

    const tPath = path.join(item.cssPath, Util.formatWords([opts.spriteName, item.name], opts.connector)) + '.' + opts.processor;

    fs.writeFile(tPath, item.template, function(err) {
      if (err) return console.log(err);
    });

  })
}

const createImg = () => {

  const layouts = spritesLayout();

  if (_.isUndefined(layouts) || !_.isArray(layouts) || _.isEmpty(layouts)) {
    return Util.throwError('noLayout');
  }

  layouts.forEach( (layout) => {

    const tEnlarge = layout.enlarge;
    let tItemX;
    let tItemY;
    async.waterfall([
      function(next) {
        lwip.create(
          layout.width,
          layout.height,
          opts.color,
          next
        );
      },
      function(image, next) {
        async.eachSeries(layout.items, function(item, callback) {
          tItemX = item.x + opts.margin;
          tItemY = item.y + opts.margin;

          lwip.open(item.extra.imgPath, function(err, imgObj) {
            image.paste(tItemX, tItemY, imgObj, callback);
          });
        }, function () {
          next(null, image);
        });
      },
      function(image, next) {
        const tName = layout.imgName;
        const lIndex = tName.lastIndexOf('.');
        const nameFix = tEnlarge ? tName.slice(0, lIndex) + `@${tEnlarge}x` + tName.slice(lIndex) : tName;
        const imgFinalPath = path.join(opts.imgPath, nameFix);

        if (tEnlarge) {
          const resizeW = layout.width / tEnlarge;
          const resizeY = layout.height / tEnlarge;
          const resizeImgPath = path.join(opts.imgPath, layout.imgName);

          image.clone(function(err, clone) {
            clone.resize(resizeW, resizeY, 'grid', function (err, image) {
              image.writeFile(resizeImgPath, function(err, file) {
                // console.log('ResizedImage has been created')
              });
            });
          });
        }

        image.writeFile(imgFinalPath, function(err, file) {
          // console.log('SpriteImage has been created')
        });

      }
    ], function(err) {
      if (err) return console.log('waterfall ERR: ', err);
    });
  });
}

const create = () => {

  createCss();
  createImg();
}

module.exports = {
  options: opts,

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
  },

  generate: function (config) {
    initConfig(config);
    // console.log(templater)
    // getImagesData();
    // spritesLayout();
    // transformStyles();
    create();
  }
};
