'use strict';

import fs from 'fs';
import path from 'path';
import mustache from 'mustache';
import cssesc from 'cssesc';
import { formatWords, isPathExist } from '../utils/util';
import _ from '../utils/underscore';

const tmplPathFn = (processor, templatePath) => {
  let tmplPath = `${__dirname}/${processor}.mustache`;
  if (!_.isUndefined(templatePath) && !_.isEmpty(templatePath) && _.isString(templatePath) && isPathExist(templatePath)) {
    tmplPath = templatePath;
  }

  return fs.readFileSync(tmplPath, 'utf8');
}

const cssTemplate = (params) => {
  // console.log('params: ', params)
  const cssItems = params.items;
  const anotherCssItems = params.sprites;
  const spritesheet = params.spritesheet;
  const imgX = spritesheet.width;
  const imgY = spritesheet.height;
  const options = params.options;
  const clsNamePrefix = options.cssClass;
  const wEnlarge = options.enlarge;
  let template = {
    items: null,
    enlarge: wEnlarge,
    imgUrl: null
  };

  template.items = cssItems.map( (item) => {
    item.image = item.image.replace(/\\/g, '\/');
    item.escaped_image = item.escaped_image.replace(/\\/g, '\/');
    item.name = formatWords([clsNamePrefix, item.name], options.connector);
    item['class'] = '.' + cssesc(item.name, {isIdentifier: true});
    if (wEnlarge) {
      const insertIndex = item.escaped_image.lastIndexOf('.');
      if (insertIndex > 0) {
        item['enlargedImage'] = `${item.escaped_image.slice(0, insertIndex)}@${wEnlarge}x${item.escaped_image.slice(insertIndex)}`
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
  const tmplFile = tmplPathFn(options.processor, options.templatePath);
  const css = mustache.render(tmplFile, template);
  return css;
}

module.exports = cssTemplate;
