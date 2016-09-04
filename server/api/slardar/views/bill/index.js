'use strict';

const View = require('views/base');

function main(app, clientApps, currentView, viewPlugins) {
  let views = app.get('views');
  views.push(__dirname);
  const view = new View(app, clientApps, currentView, viewPlugins);
  view.init();
}

function haloProcessor(user, HALO) {
  HALO.application.application_list = HALO.application.application_list.filter( e => {
    return HALO.settings.enable_charge ? true : e !== 'bill';
  });
}

module.exports = {
  main: main,
  haloProcessor: haloProcessor
};
