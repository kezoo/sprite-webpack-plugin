module.exports = {
  spriteName: 'sprite',
  connector: 'dash',
  baseName: 'base',
  orientation: 'vertical',
  background: '#FFFFFF',
  format: 'png',
  source: process.cwd() + '/sprites/',
  cssPath: process.cwd() + '/styles/',
  imgPath: process.cwd() + '/images/',
  processor: 'css',
  templatePath: process.cwd() + '/templates/',
  opacity: 0,
  prefix: 'icon',
  useImport: false,
  indexName: 'index',
  bundleMode: 'one'
};
