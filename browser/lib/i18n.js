const path = require('path')
const electron = require('electron')
const { getLocales } = require('./Languages.js')

// load package for localization
const i18n = new (require('i18n-2'))({
  // setup some locales - other locales default to the first locale
  locales: getLocales(),
  extension: '.json',
  directory: process.env.NODE_ENV === 'production'
    ? path.join(electron.remote.app.getAppPath(), './locales')
    : path.resolve('./locales'),
  devMode: false
})

export default i18n
