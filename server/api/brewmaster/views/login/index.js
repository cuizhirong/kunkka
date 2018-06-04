'use strict';
const co = require('co');
const View = require('views/base');
const drivers = require('drivers');
const listDomainsAsync = drivers.keystone.domain.listDomainsAsync;
const adminLogin = require('api/slardar/common/adminLogin');
const config = require('config');
const keystoneRemote = config('keystone');
const base = require('../../api/base');

function main(app, clientApps, currentView, viewPlugins) {
  let views = app.get('views');
  views.push(__dirname);
  const view = new View(app, clientApps, currentView, viewPlugins);
  view.settingConfig = ['global', 'auth'];

  // rewrite render qualification
  view.renderChecker = function (setting, req, res, next) {
    const that = this;
    co(function* () {
      let locale = that.upperCaseLocale(req.i18n.getLocale());
      let user = (req.session && req.session.user) ? req.session.user : {};
      let HALO = that.getHALO(locale, setting, user);
      if (that.plugins) {
        that.plugins.forEach(p => p.model.haloProcessor ? p.model.haloProcessor(user, HALO) : null);
      }
      if (req.session && req.session.user) {
        res.redirect('/' + HALO.application.application_list[0]);
        return;
      }

      let enableCaptcha = yield base.func.getLoginCaptcha(req.session);
      if (!enableCaptcha) {
        setting.enable_login_captcha = false;
      }

      let result = yield adminLogin();
      let resDomains = yield listDomainsAsync(result.token, keystoneRemote, {});
      setting.domains = resDomains.body.domains.map(domain => domain.name);
      that.renderTemplate(setting, HALO, locale, req, res, next);

    }).catch(next);
  };
  view.getTemplateObj = function (HALO, locale, setting, __) {
    return {
      HALO: JSON.stringify({
        configs:{lang: locale},
        settings: setting,
        kunkka_remotes: HALO.kunkka_remotes
      }),
      locale,
      unitedstack: __(`views.${this.name}.unitedstack`),
      subtitle: __(`views.${this.name}.login`),
      forgotPass: __(`views.${this.name}.forgotPass`),
      LangJsFile: this.staticFiles[locale][`${this.name}LangJsFile`],
      loginJsFile: this.staticFiles[`${this.name}JsFile`],
      loginCssFile: this.staticFiles[`${this.name}CssFile`],
      uskinFile: this.uskinFile[0],
      auth_logo_url: setting.auth_logo_url ? setting.auth_logo_url : '/static/assets/login/logo@2x.png',
      favicon: setting.favicon ? setting.favicon : '/static/assets/favicon.ico',
      company: setting.company ? setting.company : '©2016 UnitedStack Inc. All Rights Reserved. 京ICP备13015821号',
      title: setting.title ? setting.title : 'UnitedStack',
      viewCss: setting['view.css'] ? setting['view.css'] : '',
      modelTmpl: ''
    };
  };
  view.initRoute = function () {
    this.app.get(['/', '/auth/login', '/login'], this.renderHandler.bind(this));
    this.app.get('/auth', (req, res) => {
      res.redirect('/auth/login');
    });
  };

  view.init();
}

function haloProcessor(user, HALO) {

}

module.exports = {main, haloProcessor};
