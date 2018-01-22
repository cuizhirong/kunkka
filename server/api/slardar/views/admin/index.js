'use strict';
const _ = require('lodash');

const View = require('views/base');
const moduleRoles = {
  'registration-approval': ['admin_audit'],
  'approved-registration-application': ['admin_audit'],
  'quota-approval': ['admin_audit'],
  'host': ['admin_system'],
  'host-overview': ['admin_system'],
  'instance': ['admin_system'],
  'host-aggregates': ['admin_system'],
  'availability-zones': ['admin_system'],
  'instance-restore': ['admin_system'],
  'flavor': ['admin_system'],
  'image': ['admin_system'],
  'private-image': ['admin_system'],
  'snapshot-type': ['admin_system'],
  'volume': ['admin_system'],
  'volume-type': ['admin_system'],
  'qos-spec': ['admin_system'],
  'snapshot': ['admin_system'],
  'network': ['admin_system'],
  'subnet': ['admin_system'],
  'router': ['admin_system'],
  'floating-ip': ['admin_system'],
  'port': ['admin_system'],
  'domain': ['admin_safety'],
  'project': ['admin_safety'],
  'user': ['admin_safety'],
  'service-user': ['admin_safety'],
  'user-group': ['admin_safety'],
  'role': ['admin_safety'],
  'system-information': ['admin_system'],
  'compute-services': ['admin_system'],
  'block-storage-services': ['admin_system'],
  'network-agents': ['admin_system'],
  'orchestration-services': ['admin_system'],
  'metadata-definition': ['admin_system'],
  'feature-mgmt': ['admin_safety'],
  'module-mgmt': ['admin_safety'],
  'action-log': ['admin_audit']
};

function main(app, clientApps, currentView, viewPlugins) {
  let views = app.get('views');
  views.push(__dirname);
  const view = new View(app, clientApps, currentView, viewPlugins);
  view.init();
}

function haloProcessor(user, HALO) {
  HALO.application.application_list = HALO.application.application_list.filter( e => {
    return user.isAdmin ? true : e !== 'admin';
  });
  if (user.isAdmin && HALO.settings && HALO.settings.enable_safety) {
    const roles = user.roles;
    const adminRoles = _.intersection(roles, ['admin_safety', 'admin_audit', 'admin_system']);
    if (adminRoles.length) {
      let moduleConfig = HALO.settings.module_config;
      try{
        moduleConfig = JSON.parse(moduleConfig);
        const adminModule = moduleConfig.admin;
        Object.keys(moduleRoles).forEach(m => {
          if (!_.intersection(adminRoles, moduleRoles[m]).length) {
            adminModule[m].show = false;
          }
        });
        HALO.settings.module_config = JSON.stringify(moduleConfig);
      } catch (e) {
        return;
      }
    }
  }
}

module.exports = {
  main: main,
  haloProcessor: haloProcessor
};
