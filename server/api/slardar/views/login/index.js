'use strict';

const View = require('views/base');

function main(app, clientApps, currentView, viewPlugins) {
  let views = app.get('views');
  views.push(__dirname);
  const view = new View(app, clientApps, currentView, viewPlugins);
  // rewrite render qualification
  view.renderChecker = function (setting, req, res, next) {
    let locale = this.upperCaseLocale(req.i18n.getLocale());
    let user = (req.session && req.session.user) ? req.session.user : {};
    let HALO = this.getHALO(locale, setting, user);
    if (this.plugins) {
      this.plugins.forEach(p => p.model.haloProcessor ? p.model.haloProcessor(user, HALO) : null);
    }
    if (!req.session || !req.session.user) {
      this.renderTemplate(setting, HALO, locale, req, res, next);
    } else if (req.session && req.session.user){
      res.redirect('/' + HALO.application.application_list[0]);
    }
  };
  view.getTemplateObj = function(HALO, locale, setting, __) {
    return {
      locale: locale,
      unitedstack: __('views.login.unitedstack'),
      login: __('views.login.login'),
      signup: __('views.login.signup'),
      forgotPass: __('views.login.forgotPass'),
      loginJsFile: this.staticFiles[locale].loginJsFile,
      loginCssFile: this.staticFiles.loginCssFile,
      uskinFile: this.uskinFile[0],
      settings: setting,
      logo_url: setting.logo_url ? setting.logo_url : '/static/assets/logo@2x.png',
      favicon: setting.favicon ? setting.favicon : '/static/assets/favicon.ico',
      company: setting.company ? setting.company : '©2016 UnitedStack Inc. All Rights Reserved. 京ICP备13015821号',
      title: setting.title ? setting.title : 'UnitedStack',
      viewCss: setting['view.css'] ? setting['view.css'] : '',
      modelTmpl: this.reactDOMServer.renderToString(this.viewModelFactory({
        __: __(`shared.${this.name}`),
        HALO: HALO
      }))
    };
  };
  view.initRoute = function() {
    this.app.get(/^\/$/, this.renderHandler.bind(this));
    this.app.get('/login', this.renderHandler.bind(this));
  };
  view.init();
}

function haloProcessor(user, HALO) {

}

module.exports = {
  main: main,
  haloProcessor: haloProcessor
};
