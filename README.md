# Sprite-webpack-plugin

Build CSS sprite on the fly while running Webpack task.
Currently support the following CSS compilers: 
  * less
  * sass / scss
  * stylus

## Usage:

> install: npm install sprite-webpack-plugin

> then in webpack-config.js to initialize it:

*Example in webpack-config.js:*
<pre><code>
var sprite = require('sprite-webpack-plugin');

module.exports = {
  plugins: [
    new sprite({
      'source': __dirname + '/sprites/',
      'imgPath': __dirname + '/app/images/',
      'cssPath': __dirname + '/app/styles/'
    });
  ]
}
</code></pre>

**NOTE: This is just a simple example to show you how to use the plugin. if you are still unfamiliar with Webpack, you may need head [here][id] to learn it firstly.
[id]: http://webpack.github.io

######Acturally if your project is not that big, then the example above is all you need to do.######

### How it works ###

- source: ***string*** image resource.

- imgPath: ***string*** will genetate sprite image.

- cssPath: ***string*** will generate stylesheet.

- prefix: ***string*** the prefix of sprite CLASS name
  
  DEFAULT: "icon""
 
 **NOTE, you need import that generated stylesheet to your pages.
 
 final className would be: *prefix-imagename*
 
 Now you can call this CLASS.

### Other Parameters

- spriteName: ***string*** the name of generated image and stylesheet

  DEFAULT: "sprite-base"
  
- orientation: ***string*** vertical or horizontal 
  
  DEFAULT: "vertical"
  
- format: ***string*** sprites images format

  DEFAULT: "png"
  
- processor: ***string*** css or less or sass or scss or stylus

  DEFAULT: "css"
  
- opacity: ***number*** 0 ~ 1

  DEFAULT: 0
  
- indexName: ***string*** sprite index name

  DEFAULT: "sprite-index"
  
- multiFolders: ***boolean*** true or false 

  DEFAULT: false
  
  > (recommended for big project and people who want to sort it modularly)
  
  **Note: 
  
  If you enable this, the plugin will generate sprites images and stylesheets
   
  based on the structure of your source folder.
  
  ######how it works:######
  
  Let's assumed we have a source dir named 'sprites'.
  
  'sprites' has sub folders: home, users, etc...
  
    * sprites/ *.png
  
    * sprites/home/ *.png
  
    * sprites/users/ *.png
    
    * ...
  
  Image dir would be like: 
  
    * images/sprite-base.png
  
    * images/home/sprite-home.png
  
    * images/users/sprite-users.png
  
    * ...
    
  Styles dir would be like:
  
    * styles/sprite-base.css
    
    * styles/home/sprite-home.css
  
    * styles/users/sprite-users.css
  
    * ...
    
   As you can see, when you enable this feature, the option 'spriteName' will be no use.
   
   the plugin will automagically name for you.
   
   if sub folders is empty, then the plugin will do nothing.
   
  
- useImport: ***boolean*** true or false

  DEFAULT: false
  
  **Note: 
  
  This feature will only available when you enabled multiFolders.
  
  ######how it works:######
  
  remember the option 'indexName'?! DEFAULT is 'sprite-idnex'
  
  Let's assumed we have a sprite index file in our styles dir
  
    * styles/sprite-index.css
  
  and other generated stylesheets in styles dir
  
    * styles/sprite-base.css
    
    * styles/home/sprite-home.css
  
    * styles/users/sprite-users.css
    
  then the file 'sprite-index.css' would be like this:
  
    > @import "sprite-base.css";
      
    > @import "home/sprite-home.css";
      
    > @import "users/sprite-users.css";
    
  All you need to do is linking 'sprite-index.css' to your project.
  

####classname####
classname: prefix-imagename

####help####
p.s. If there are still any questions remained, don't hesitate to start an issue.


##### To-Do: 
optimize code. :)


Partially inspired by Css-Sprite, thanks.

##### License:
Project code is released under MIT license:

