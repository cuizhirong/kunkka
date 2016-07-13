'use strict';

const View = require('views/base');

function main(app, clientApps, currentView, viewPlugins) {
  let views = app.get('views');
  views.push(__dirname);
  const view = new View(app, clientApps, currentView, viewPlugins);
  view.init();
}

function haloProcessor(user, HALO) {
  HALO.application.application_list = HALO.application.application_list.sort((a, b) => {
    if (a === 'dashboard') {
      return -1;
    } else if (b === 'dashboard') {
      return 1;
    } else {
      return 0;
    }
  });
}

module.exports = {
  main: main,
  haloProcessor: haloProcessor
};
