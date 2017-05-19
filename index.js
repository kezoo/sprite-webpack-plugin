import fs from 'fs';
import path from 'path';
import Sprite from './lib/sprite-webpack';
import _ from 'underscore';

function SpriteWebpackPlugin(options) {
  this.options = _.assign(Sprite.options, options);
}

SpriteWebpackPlugin.prototype.apply = function(compiler) {
  Sprite.generate(this.options);
};

module.exports = SpriteWebpackPlugin;
