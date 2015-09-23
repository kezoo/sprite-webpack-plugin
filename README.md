# Sprite-webpack-plugin

Build CSS sprite on the fly while running Webpack task.
Currently support the following CSS compilers: 
  * less
  * scss
  * stylus

## Usage:

> install: npm install sprite-webpack-plugin

> then in webpack-config.js to initialize it:

Example: 

<pre><code>
new sprite({
  'source': __dirname + '/sprites/',
  'imgPath': __dirname + '/app/images/',
  'cssPath': __dirname + '/app/styles/'
})
</code></pre>

Here are available options:
<pre><code>
spriteName: name
orientation: vertical | horizontal 
background: background color
format: image format
source: original images directory
cssPath: generated css directory
imgPath: generated image directory
processor: css | less | sass | scss | stylus
opacity: 0 ~ 1
multiFolders: default is FALSE (will generate sprite based on the structure of your source directory)
margin: 0
</code></pre>

##### To-Do: 
optimize code. :)

Partially inspired by Css-Sprite, thanks.

##### License:
Project code is released under MIT license:

