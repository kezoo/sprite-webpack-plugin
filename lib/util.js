var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var mkdirp = require('mkdirp');

module.exports = {
  BaseDirName: 'F0UNKNOWNNAME0K',

  getPiece: function(item, slice, sign) {
    sign = sign || "";
    var splits = item.split(sign), length = splits.length;
    return splits[length - slice];
  },

  stringJoiner: function(text, sign) {
    return [sign, text, sign].join('');
  },

  checkDir: function(path, callback) {
    fs.exists(path, function(exists) {
      if (!exists) {
        mkdirp(path, function(err) {
          if (err) { console.error(err); }
          else { callback && callback(); }
        });
      }
      else { callback && callback(); }
    });
  },

  deleteDir: function(files, _path) {
    var list = [];
    files.forEach(function(file) {
      if (!fs.statSync(path.join(_path, file)).isDirectory())
        list.push(file);
    });
    return list;
  },

  backslashToSlash: function(item) {
    return item.replace(/\\/g, '\/');
  },

  isImage: function(filename) {
    var imageTypes = ['png', 'jpg', 'jpeg', 'gif'];
    var ext = filename.split('.').pop();
    return _.include(imageTypes, ext);
  },

  walk: function(dir) {
    var self = this;
    var recursiveDir = {};
    var baseDirName = self.BaseDirName;
    function handleWalk(dir, sign) {
      var list = fs.readdirSync(dir);
      list.forEach(function(file) {
        var innerDir = path.join(dir, file);
        var stat = fs.statSync(innerDir);
        if (sign) {
          if (!recursiveDir[sign]) { recursiveDir[sign] = []; }
          if (!stat.isDirectory()) {
            if (!self.isImage(file)) { return; }
            recursiveDir[sign].push({ file: file, path: dir });
          }
        }
        if (stat && stat.isDirectory()) {
          handleWalk(innerDir, file);
        } else {
          if (!sign) {
            if (!recursiveDir[baseDirName]) { recursiveDir[baseDirName] = []; }
            if (!self.isImage(file)) { return; }
            recursiveDir[baseDirName].push({ file: file, path: dir });
          }
        }
      });
    }
    handleWalk(dir);
    _.forIn(recursiveDir, function(v, i) {
      if (_.isEmpty(v)) delete recursiveDir[i];
    });
    return recursiveDir;
  },

  checkSource: function(path) {
    var self = this;
    var imageTypes = ['png', 'jpg', 'jpeg', 'gif'];
    var flag = true, filelist = [];
    try {
      stats = fs.lstatSync(path);
      if (_.isEmpty(fs.readdirSync(path))) {
        flag = false;
      } else {
        var results = self.walk(path);
        _.forEach(results, function(items) {
          _.forEach(items, function(item) {
            filelist.push(item.file.split('.').pop());
          });
        });
      }
      if (_.isEmpty((_.pull(filelist, 'DS_Store')))) {
        flag = false;
      }
    }
    catch(e) {
      flag = false;
    }
    return flag;
  }

};

