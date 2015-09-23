var fs = require('fs');
var _ = require('lodash');

module.exports = {
  formatBytes: function(bytes,decimals) {
     if(bytes == 0) return '0 Byte';
     var k = 1000;
     var dm = decimals + 1 || 3;
     var sizes = ['Bytes', 'KB', 'MB'];
     var i = Math.floor(Math.log(bytes) / Math.log(k));
     return (bytes / Math.pow(k, i)).toPrecision(dm) + ' ' + sizes[i];
  },

  getPiece: function(item, slice, sign) {
    sign = sign || "";
    var splits = item.split(sign), length = splits.length
    return splits[length - slice]
  },

  stringJoiner: function(text, sign) {
    return [sign, text, sign].join('');
  },

  checkDir: function(path, callback) {
    fs.exists(path, function(exists) {
      if (!exists) {
        fs.mkdirSync(path, function(err) {
          if (err) return console.log(err);
        })
        if (_.isFunction(callback)) callback();
        return;
      }
      if (_.isFunction(callback)) callback();
    });
  },

  deleteDir: function(files, path) {
    var list = [];
    files.forEach(function(file) {
      if (!fs.statSync(path + file).isDirectory()) 
        list.push(file)
    })
    return list;
  },

  walk: function(dir) {
    var recursiveDir = {}
    function handleWalk(dir, sign) {
      var list = fs.readdirSync(dir)
      list.forEach(function(file) {
        var innerDir = dir + file
        var stat = fs.statSync(innerDir)
        if (sign) {
          if (!recursiveDir[sign]) { recursiveDir[sign] = [] }
          if (!stat.isDirectory()) {
            recursiveDir[sign].push({ file: file, path: dir });
          }
        }
        if (stat && stat.isDirectory()) {
          handleWalk(innerDir + '/', file)
        } else {
          if (!sign) {
            if (!recursiveDir['sprites']) { recursiveDir['sprites'] = [] }
            recursiveDir['sprites'].push({ file: file, path: dir });
          }
        }
      });
    }
    handleWalk(dir)
    return recursiveDir;
  }
}

