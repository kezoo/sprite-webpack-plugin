'use strict';

// Load in local modules
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

// Define our css template fn ({items, options}) -> css
function cssTemplate (params) {
  // Localize parameters
  var items = params.items;
  var options = params.options;
  var tmpName = options.cssClass
  var template = { items: [] }
  // Add class to each of the options
  items.forEach(function saveClass (item) {
    item.name = tmpName + "-" + item.name
    if (item.name) {
      item['class'] = '.' + cssesc(item.name, {isIdentifier: true});
    }
    template.items.push(item)
  });

  // Render and return CSS
  var tmplFile = options.template ?
    fs.readFileSync(path.resolve(process.cwd(), options.template), 'utf8') :
    tmpl[options.processor];
  var css = mustache.render(tmplFile, template);
  return css;
}

// Export our CSS template
module.exports = cssTemplate;
