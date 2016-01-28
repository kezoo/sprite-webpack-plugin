# Sprite-webpack-plugin

2016.01 Updates:
```
 - fix slash problems on windows.
 - set option 'bundleMode' instead of 'multiFolders' (please take notice of this).
 - fix stylus extension.
 - fix sprite image size, should be more appropriate.
 - fix source dir that is located inside the outputted images dir caused problems.
```

Next, Refactoring the code, actually I've already done a little, and also add support for Retina.
( For Retina display, what I thought about is you can specify one or few directories as Retina outputs, but in this way, we need a way to remember this. )
The expecting date is unknown now, hope soon.

Build CSS sprite on the fly while running Webpack task.
Currently support the following CSS compilers:
```bash
  * less
  * sass / scss
  * stylus
```

## Install:

```bash
npm install sprite-webpack-plugin
```

## Usage:

- A simple example in webpack.config.js:

```javascript
var sprite = require('sprite-webpack-plugin');

module.exports = {
  plugins: [
    new sprite({
      'source' : __dirname + '/sprites/',
      'imgPath': __dirname + '/app/images/',
      'cssPath': __dirname + '/app/styles/'
    });
  ]
}
```

If you want to learn more about Webpack, so [here is the link][id].
[id]: http://webpack.github.io

### Options ###
```bash
source: String, path to sprites source dir.

imgPath: String, path to sprites output dir.

cssPath: String, path to sprites stylesheets output dir.

prefix: String, the prefix of sprites classname, Default is 'icon'

connector: String, 'dash' or 'underline', Default is 'dash'

spriteName: String, this is the prefix of all outputted files names, Default is 'sprite'

baseName: String, this is the base name, Default is 'base'

orientation: String, 'vertical' or 'horizontal', Default is 'vertical'

format: String, image format, 'png' or 'jpg', Default is 'png'

processor: String, css processor, 'css' or 'less' or 'sass' or 'scss', Default is 'css'

opacity: Number, 0 - 1, Default is 0

indexName: String, the sprite css index file name, when you use 'useImport' option

bundleMode: String, 'one' or 'multiple', Default is 'one'.

[ bundleMode explanation ] the plugin will walk source dir recursively.

when you choose 'one', the final outputted image file or css file would be bundled as single one file.

when you choose 'multiple', the outputted files would be based on the structure of the source dir.

Imagine the source dir would be like this:
(source dir can be either inside your images dir or outside it)

├── src
    └── styles
    └── images
        └── spritesource
            └── home
            │   └── example.png
            └── users
            │   └── user.png
            └── button.png

If you select 'one', it would look like this:

├── src
    └── styles
        └── sprite-base.css
    └── images
        └── sprite-base.png
        └── spritesource
            └── home
            │   └── example.png
            └── users
            │   └── user.png
            └── button.png

If you select 'multiple', then it would look like this:

├── src
    └── styles
    │   └── sprite-base.css
    │   └── sprite-home.css
    │   └── sprite-users.css
    └── images
        └── sprite-base.png
        └── sprite-home.png
        └── sprite-users.png
        └── spritesource
            └── home
            │   └── example.png
            └── users
            │   └── user.png
            └── button.png

A little thing about name:

"sprite-base.css":
- the "sprite" is the option 'spriteName'.
- the "-" is the option 'connector'.
- the "base" is the option 'baseName'.
- the "css" is the option 'processor'.

So the final file name has two ways:
1. source files which are presented directly in the source dir.
the name would be: spriteName + connector + baseName + "." + processor
2. source files which are presented in sub dirs.
the name would be: spriteName + connector + subDirName + "." + processor

By the way, the className is: "." + prefix + connector + imageName

useImport: Boolean true or false, Default is false
if you set 'bundleMode' as 'one', this option will not be useful anymore.

[ useImport explanation ]
If you set true, and if you also preferred 'multiple',
the plugin will attempt to find your 'sprite-index.css' (spriteName + connector + indexName + "." + proccesor),
if not found, the plugin will create it,
then automatically add css '@import' for you. It would look like this:

@import "./sprite-base.css";
@import "./sprite-home.css";
@import "./sprite-users.css";

```


####help####
If there are still any questions remained, don't hesitate to start an issue or you can pull a request to help it, cheers.

Partially inspired by Css-Sprite, thanks.

##### License:
Project code is released under MIT license:

