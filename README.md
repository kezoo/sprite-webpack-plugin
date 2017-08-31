# Sprite-webpack-plugin


### Enviroment

```
  Node < 6.0, webpack 1.0
```

### Install

```
  npm install sprite-webpack-plugin --save-dev
```

### Usage

- A simple example, in webpack config file:

```javascript

  var sprite = require('sprite-webpack-plugin');

  module.exports = {
    plugins: [
      new sprite({
        'source' : __dirname + '/source/',
        'imgPath': __dirname + '/images/',
        'cssPath': __dirname + '/styles/'
      });
    ]
  }

```

### Options

```
  source {String} path to icons dir

  imgPath {String} path to image(s) output dir

  cssPath {String} path to style(s) output dir

  prefix  {String} icon prefix name, default "icon"

  connector {String} an connection between prefix and icon name.
             "-", "_", "capitalize", ""(means nothing), default "-"

  spriteName {String} prefix name of images and css files, default "sprite"

  baseName {String} file name if only one css file will be created

  orientation {String} 'vertical' or 'horizontal', default 'vertical'

  format {String} image format, 'png' or 'jpg', default 'png'

  processor {String} css processor, 'css' or 'less' or 'sass' or 'stylus', default 'css'

  opacity {Number} 0 - 1, default 0

  isBundled {Boolean} bundle all icons as a single one image file or output them
            based your directory structure (means one subdir could produce
            one image file and one css file), default true

  enlarge {Number} for retina display, valid number 1 - 3, default null

  margin {Number} make sprite image prettier, valid number 2 - 10, default 2

  templatePath {String} define your own css template, default null

  fixedStylePath {String} this is for the css property 'background-url',
                 if you know the image url, you can assign it here, recommend.
                 otherwise the plugin will use the relative path.
                 :new:, add support for base64, simply just using this word.


```


A more imaginable way to explainate option "isBundled"

###### source directory structure

```
├── src
    └── styles
    └── images
        └── spritesource
            └── home
            │   └── example.png
            └── users
            │   └── user.png
            └── button.png

If you set true, the output would look like this:

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

If you set false, then it would look like this:

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
```


By the way, the className is: "." + prefix + connector + iconName


##### Help & License:

If there are still any questions remained, don't hesitate to start an issue or you can pull a request to help it, cheers.

Partially inspired by Css-Sprite, thanks.
Project code is released under MIT license:

