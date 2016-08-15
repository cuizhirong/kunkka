'use strict';

const View = require('views/base');
const config = require('config');
const roleFlow = config('ticket_flow') || [];
const roleFlowLength = roleFlow.length;
const getRoleIndex = require('../../api/base').prototype.getRoleIndex;

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
  let currentView = 'ticket';
  let setting = HALO.settings;
  let selfTicket = true;
  let othersTicket = true;
  let enableTicket = setting.enable_ticket;
  if (enableTicket) {
    let roleIndex = getRoleIndex(user.roles);
    if (roleIndex === 0) {
      selfTicket = false;
    }
    if (roleIndex === roleFlowLength - 1) {
      othersTicket = false;
    }
    HALO.configs.ticket = enableTicket ? {show_apply: selfTicket, show_manage: othersTicket} : null;
  }
  HALO.application.application_list = HALO.application.application_list.filter(e => {
    return enableTicket ? true : e !== currentView;
  });
}

module.exports = {
  main: main,
  haloProcessor: haloProcessor
};
