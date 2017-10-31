'use strict';

function View(app, clientApps, currentView, viewModels) {
  this.name = currentView;
  this.react = require('react');
  this.reactDOMServer = require('react-dom/server');
  this.glob = require('glob');
  this.co = require('co');
  this.viewModel = require(`client/applications/${currentView}/model.jsx`);
  this.viewModelFactory = this.react.createFactory(this.viewModel);
  this.config = require('config');
  this.tusk = require('api/tusk/dao');
  this.websocketUrl = this.config('websocket');
  this.regions = {};
  this.uskinFile = this.glob.sync('*.uskin.min.css', {
    cwd: 'client/dist/uskin'
  });
  this.staticFiles = {};
  this.domain = this.config('domain');
  this.settingConfig = ['global', currentView];
  this.app = app;
  this.upperCaseLocale = require('helpers/upper_case_locale');
  this.applications = clientApps;
  this.plugins = viewModels;
}

View.prototype = {
  init: function() {
    const languages = Object.keys(this.config('region')[0].name);
    languages.forEach((lang) => {
      this.regions[lang] = [];
      this.config('region').forEach((reg) => {
        this.regions[lang].push({
          name: reg.name[lang],
          id: reg.id
        });
      });
    });
    const files = this.glob.sync('*', {
      cwd: 'client/dist/'
    });
    const locales = JSON.parse(JSON.stringify(global.locales.availableLocales)).map(this.upperCaseLocale);
    locales.forEach((locale) => {
      this.staticFiles[locale] = {};
      let regex = new RegExp(`${locale}.${this.name}.min.js$`);
      files.some((file) => {
        return file.match(regex) && (this.staticFiles[locale][`${this.name}JsFile`] = file);
      });
    });
    let cssRegex = new RegExp(`${this.name}.min.css$`);
    this.staticFiles[`${this.name}CssFile`] = files.find((el) => {
      return el.match(cssRegex) !== null;
    });
    this.initRoute();
  },
  initRoute: function() {
    let routeRegExp = new RegExp(`(^\/${this.name}$)|(^\/${this.name}\/(.*))`);
    this.app.get(routeRegExp, this.renderHandler.bind(this));
  },
  getSetting: function(settings, configs) {
    let result = {};
    settings.forEach(setting => setting.forEach(s => result[s.name] = s.value));
    return result;
  },
  renderHandler: function(req, res, next) {
    let that = this;
    this.co(function* () {
      let yeildArray = [];
      that.settingConfig.forEach(c => yeildArray.push(that.tusk.getSettingsByApp(c)));
      let result = yield yeildArray;
      let setting = that.getSetting(result, that.settingConfig);
      that.renderChecker(setting, req, res, next);
    }).catch(e => {
      res.status(500).send(e);
    });
  },
  renderChecker: function (setting, req, res, next) {
    if (req.session && req.session.user) {
      let locale = this.upperCaseLocale(req.i18n.getLocale());
      let user = (req.session && req.session.user) ? req.session.user : {};
      let HALO = this.getHALO(locale, setting, user);
      if (req.session.endpoint.kiki) {
        HALO.configs.kiki_url = req.session.endpoint.kiki[user.regionId];
      }
      if (req.session.endpoint.swift) {
        HALO.configs.swift_url = req.session.endpoint.swift[user.regionId];
      }
      if (this.plugins) {
        this.plugins.forEach(p => p.model.haloProcessor ? p.model.haloProcessor(user, HALO) : null);
      }
      if (HALO.application.application_list.indexOf(this.name) === -1) {
        res.redirect('/' + HALO.application.application_list[0]);
      } else {
        this.renderTemplate(setting, HALO, locale, req, res, next);
      }
    } else {
      res.redirect('/');
    }
  },
  getHALO: function(locale, setting, user) {
    return {
      configs: {
        lang: locale,
        domain: user.domainName || this.domain,
        domainId: user.domainId,
        adminProjectId: this.config('admin_projectId'),
        neutron_network_vlanranges: this.config('neutron_network_vlanranges')
      },
      user: {
        projectId: user.projectId,
        projects: user.projects,
        userId: user.userId,
        username: user.username,
        roles: user.roles
      },
      region_list: this.regions[locale],
      current_region: user.regionId ? user.regionId : this.regions[locale][0].id,
      // FIXME:
      websocket: {
        url: this.websocketUrl[user.regionId]
      },
      application: {
        application_list: this.applications,
        current_application: this.name
      },
      settings: setting
    };
  },
  getTemplateObj: function(HALO, locale, setting, __) {
    return {
      HALO: JSON.stringify(HALO),
      mainJsFile: this.staticFiles[locale][`${this.name}JsFile`],
      mainCssFile: this.staticFiles[`${this.name}CssFile`],
      uskinFile: this.uskinFile[0],
      favicon: setting.favicon ? setting.favicon : '/static/assets/favicon.ico',
      title: setting.title ? setting.title : 'UnitedStack 有云',
      viewCss: setting['view.css'] ? setting['view.css'] : '',
      modelTmpl: ''
    };
  },
  renderTemplate: function(setting, HALO, locale, req, res, next) {
    let __ = req.i18n.__.bind(req.i18n);
    HALO.application.application_list = HALO.application.application_list.map(a => {
      return {[a]: __(`shared.${a}.application_name`)};
    });
    global.HALO = JSON.parse(JSON.stringify(HALO));
    global.HALO.configs.renderer = 'server';
    global.HALO.configs.init = false;
    let templateObj = this.getTemplateObj(HALO, locale, setting, __);
    res.render(this.name, templateObj);
  }
};

module.exports = View;
