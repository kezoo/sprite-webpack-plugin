var fs = require('fs');
var path = require('path');
var Sprite = require('./lib/sprite-webpack')
var _ = require('lodash')

function SpriteWebpackPlugin(options) {
  var opt = Sprite.options;
  this.options = _.assign(opt, options);
}

SpriteWebpackPlugin.prototype.apply = function(compiler) {
  var self = this;
  var opt = self.options;
  compiler.plugin("compile", function(params) {
    Sprite.createStyles(opt);
    Sprite.createImage(opt);
  });
}

module.exports = SpriteWebpackPlugin;
