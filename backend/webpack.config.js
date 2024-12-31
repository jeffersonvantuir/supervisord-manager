const Encore = require('@symfony/webpack-encore');

Encore
  .addStyleEntry('app', './assets/styles/app.css')
  .setOutputPath('public/build/')
  .setPublicPath('/build')
  .addEntry('main', './assets/js/app.js')
  .enableVueLoader() // Habilita o Vue.js
  .enableSassLoader() // Caso você precise de Sass
  .enablePostCssLoader() // Para usar Tailwind CSS
  .enableSingleRuntimeChunk()
  .enableSourceMaps(!Encore.isProduction())
  .enableVersioning(Encore.isProduction());

module.exports = Encore.getWebpackConfig();
