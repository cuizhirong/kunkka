'use strict';

const View = require('views/base');

function main(app, clientApps, currentView, viewPlugins) {
  let views = app.get('views');
  views.push(__dirname);
  const view = new View(app, clientApps, currentView, viewPlugins);
  // rewrite render qualification
  view.renderChecker = function (setting, req, res, next) {
    if (req.session && req.session.user && req.session.user.isAdmin) {
      this.renderTemplate(setting, req, res, next);
    } else if (req.session && req.session.user){
      res.redirect('/dashboard');
    } else {
      res.redirect('/');
    }
  };
  view.init();
}

function haloProcessor(user, HALO) {
  HALO.application.application_list = HALO.application.application_list.filter( e => {
    return user.isAdmin ? true : e !== 'admin';
  });
}

module.exports = {
  main: main,
  haloProcessor: haloProcessor
};
