'use strict';

const View = require('views/base');

function main(app, clientApps, currentView, viewPlugins) {
  let views = app.get('views');
  views.push(__dirname);
  const view = new View(app, clientApps, currentView, viewPlugins);
  view.init();
}

function haloProcessor(user, HALO) {

  let currentView = 'subaccount';
  let enableSub = HALO.settings.enable_subaccount;

  if (!user.roles || user.roles.indexOf('project_owner') < 0) {
    enableSub = false;
  }

  HALO.application.application_list = HALO.application.application_list.filter(e => {
    return enableSub ? true : e !== currentView;
  });
}

module.exports = {
  main: main,
  haloProcessor: haloProcessor
};
