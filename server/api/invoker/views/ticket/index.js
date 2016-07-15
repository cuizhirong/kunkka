'use strict';

const View = require('views/base');
const getRole = require('helpers/get_role');
const config = require('config');
const roleConfig = config('invoker_approver') || {};

function main(app, clientApps, currentView, viewPlugins) {
  let views = app.get('views');
  views.push(__dirname);
  const view = new View(app, clientApps, currentView, viewPlugins);
  view.init();
  view.renderChecher = function(setting, req, res, next) {
    if (req.session && req.session.user && setting.enable_ticket) {
      this.renderTemplate(setting, req, res, next);
    } else {
      res.redirect('/');
    }
  };
}

function haloProcessor(user, HALO) {
  let currentView = HALO.application.current_applicaiton;
  let setting = HALO.settings;
  let selfTicket = true;
  let othersTicket = true;
  let enableTicket = setting.enable_ticket;
  if (enableTicket) {
    let roleObj = getRole(user.roles, roleConfig);
    if (!roleObj.showSelf) {
      selfTicket = false;
    }
    if (!roleObj.showOthers) {
      othersTicket = false;
    }
    HALO.configs.ticket = enableTicket ? {show_self: selfTicket, show_others: othersTicket} : null;
  }
  HALO.application.application_list = HALO.application.application_list.filter(e => {
    return enableTicket ? true : e !== currentView;
  });
}

module.exports = {
  main: main,
  haloProcessor: haloProcessor
};
