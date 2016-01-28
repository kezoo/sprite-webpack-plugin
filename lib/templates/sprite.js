'use strict';

var fs = require('fs');
var path = require('path');
var mustache = require('mustache');
var cssesc = require('cssesc');
var tmpl = {
  'css': fs.readFileSync(__dirname + '/css.mustache', 'utf8'),
  'scss': fs.readFileSync(__dirname + '/scss.mustache', 'utf8'),
  'sass': fs.readFileSync(__dirname + '/sass.mustache', 'utf8'),
  'less': fs.readFileSync(__dirname + '/less.mustache', 'utf8'),
  'stylus': fs.readFileSync(__dirname + '/stylus.mustache', 'utf8')
};

function cssTemplate (params) {
  var items = params.items;
  var options = params.options;
  var tmpName = options.cssClass;
  var template = { items: [] };
  items.forEach(function saveClass (item) {
    item.image = item.image.replace(/\\/g, '\/');
    item.escaped_image = item.escaped_image.replace(/\\/g, '\/');
    item.name = tmpName + options.connector + item.name;
    if (item.name) {
      item['class'] = '.' + cssesc(item.name, {isIdentifier: true});
    };
    template.items.push(item);
  });

  var tmplFile = tmpl[options.processor];
  var css = mustache.render(tmplFile, template);
  return css;
}

module.exports = cssTemplate;
