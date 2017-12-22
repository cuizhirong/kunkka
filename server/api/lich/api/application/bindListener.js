'use strict';
const co = require('co');
const emitter = require('helpers/emitter');
const drivers = require('drivers');
const sendEmailByTemplateAsync = drivers.email.sendEmailByTemplateAsync;
const getUserAsync = drivers.keystone.user.getUserAsync;
const _getSettingsByApp = require('api/tusk/dao').getSettingsByApp;
const adminLogin = require('api/slardar/common/adminLogin');
const _isSend = function*() {
  let isSend = false;
  let settings = yield _getSettingsByApp('approval');
  settings.some(s => {
    if (s.name === 'send_notification_email') {
      isSend = s.value;
      return true;
    }
  });
  return isSend;
};


module.exports = (e) => {
  if (e !== emitter) return;

  e.on('applicant_message', (data) => {
    co(function *() {
      const isSend = yield _isSend();
      let req = data.req;
      let status = data.status;
      let apply = data.apply;
      if (!isSend || !req || !apply || !status) return;
      const __ = req.i18n.__.bind(req.i18n);
      const adminToken = (yield adminLogin()).token;
      const keystoneRemote = req.session.endpoint.keystone[req.session.user.regionId];
      let user = yield getUserAsync(adminToken, keystoneRemote, apply.userId);
      user = user.body.user;
      if (!user.email) return;

      const subject = __('api.application.yourApplication') + __(`api.application.${status === 'pass' ? 'approved' : 'rejected'}`);
      const url = `${req.protocol}://${req.hostname}/approval/apply/${apply.id}`;
      const content = `<h2>${subject}</h2><p><a href="${url}">${url}</a></p>`;
      sendEmailByTemplateAsync(user.email, subject, {content});
    }).catch(console.error);

  }).on('approver_message', (data) => {
    co(function *() {
      const isSend = yield _isSend();
      let role = data.role;
      let req = data.req;
      let apply = data.apply;
      if (!isSend || !role || !req) return;

      const keystoneRemote = req.session.endpoint.keystone[req.session.user.regionId];
      const __ = req.i18n.__.bind(req.i18n);

      let roleId;

      const adminToken = (yield adminLogin()).token;
      const roles = yield drivers.keystone.role.listRolesAsync(adminToken, keystoneRemote, {name: role});
      if (roles.body.roles.length) {
        roleId = roles.body.roles[0].id;
      } else {
        return;
      }

      let assignments = yield drivers.keystone.role.roleAssignmentsAsync(adminToken, keystoneRemote, {
        'role.id': roleId
        //'scope.project.id': apply.projectId
      });
      assignments = assignments.body.role_assignments;
      let users = new Set(), groups = new Set();
      assignments.forEach(a => {
        if (a.user) {
          users.add(a.user.id);
        } else if (a.group) {
          groups.add(a.group.id);
        }
      });

      let groupUsers = yield Object.keys(groups).map(g => {
        return drivers.keystone.group.listUsersInGroupAsync(adminToken, keystoneRemote, g);
      });

      groupUsers.forEach(g => {
        g.body.users.forEach(u => {
          users.add(u.id);
        });
      });

      let listUsers = yield drivers.keystone.user.listUsersAsync(
        adminToken, keystoneRemote,
        {domain_id: req.session.user.domainId}
      );
      listUsers = listUsers.body.users;
      let userDictionary = {};
      listUsers.forEach(u => {
        userDictionary[u.id] = u;
      });
      const subject = __('api.application.newApplication');
      const url = `${req.protocol}://${req.hostname}/approval/apply-approval/${apply.id}`;
      const content = `<h2>${subject}</h2> <p><a href="${url}">${url}</a></p>`;
      for (let user of users) {
        if (userDictionary[user] && userDictionary[user].email) {
          try {
            yield sendEmailByTemplateAsync(userDictionary[user].email, subject, {content});
          } catch(sendErr) {
            console.log(sendErr.code);
          }
        }
      }
    }).catch(console.error);
  });
};
