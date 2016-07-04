'use strict';

module.exports = {
  dependencies: {
    'multer': '^1.1.0',
    'node-uuid': '^1.4.7'
  },
  config: {
    invoker_approver: {
      member: {approver: ['owner', 'admin'], scope: [], show_self: true},
      owner: {approver: ['admin'], scope: ['owner'], show_self: true},
      admin: {approver: [], scope: ['admin'], show_self: false}
    }
  },
  setting: [
    {
      app: 'global',
      name: 'enable_ticket',
      value: 'false',
      type: 'boolean'
    }
  ]
};
