'use strict';

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _spriteWebpack = require('./lib/sprite-webpack');

var _spriteWebpack2 = _interopRequireDefault(_spriteWebpack);

var _underscore = require('./lib/utils/underscore');

var _underscore2 = _interopRequireDefault(_underscore);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function SpriteWebpackPlugin(options) {
  this.options = _underscore2.default.assign(_spriteWebpack2.default.options, options);
}

SpriteWebpackPlugin.prototype.apply = function (compiler) {
  _spriteWebpack2.default.generate(this.options);
};

module.exports = SpriteWebpackPlugin;