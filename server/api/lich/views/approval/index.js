'use strict';

const View = require('views/base');
const config = require('config');
const roleFlow = config('approval_flow');
const length = roleFlow.length;
const displayDashboardRole = roleFlow[length - 1];
const reverseRoleFlow = JSON.parse(JSON.stringify(roleFlow)).reverse();


function main(app, clientApps, currentView, viewPlugins) {
  let views = app.get('views');
  views.push(__dirname);
  const view = new View(app, clientApps, currentView, viewPlugins);
  view.settingConfig = ['global', 'dashboard', 'approval'];
  view.init();
}

function haloProcessor(user, HALO) {
  if (HALO.settings.enable_approval && user.roles) {
    HALO.application.application_list = HALO.application.application_list.filter(e => {
      if (e === 'dashboard') {
        return user.roles.indexOf(displayDashboardRole) > -1;
      } else {
        return true;
      }
    });
    let showApply = true;
    let showMyApplication = true;
    let showManageApplication = true;
    let highestRole;
    reverseRoleFlow.some(role => user.roles.indexOf(role) > -1 && (highestRole = role));
    if (roleFlow.indexOf(highestRole) === 0) {
      showManageApplication = false;
    } else if (roleFlow.indexOf(highestRole) === length - 1) {
      showApply = showMyApplication = false;
    }
    HALO.configs.approval = {
      showApply,
      showMyApplication,
      showManageApplication
    };
  } else if (!HALO.settings.enable_approval) {
    HALO.application.application_list = HALO.application.application_list.filter(e => e !== 'approval');
  }
}

module.exports = {
  main,
  haloProcessor
};
