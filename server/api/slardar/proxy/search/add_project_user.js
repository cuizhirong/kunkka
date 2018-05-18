'use strict';

const drivers = require('drivers');
module.exports = function* (list, session, domainId) {
  const [{body: {projects}}, {body: {users}}] = yield [
    drivers.keystone.project.listProjectsAsync(
      session.user.token,
      session.endpoint.keystone[session.user.regionId]
    ),
    drivers.keystone.user.listUsersAsync(
      session.user.token,
      session.endpoint.keystone[session.user.regionId],
      domainId ? {domain_id: domainId} : {}
    )
  ];
  const projectObj = {},
    userObj = {};
  projects.forEach(p => {
    projectObj[p.id] = p.name;
  });
  users.forEach(u => {
    userObj[u.id] = u.name;
  });
  list.forEach(item => {
    item.project_name = projectObj[item.tenant_id || item['os-extended-snapshot-attributes:project_id'] || item['os-vol-tenant-attr:tenant_id']];
    item.user_name = userObj[item.user_id];
  });
};
