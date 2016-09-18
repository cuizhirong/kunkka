'use strict';

module.exports = {
  dependencies: {
    'multer': '^1.1.0',
    'node-uuid': '^1.4.7'
  },
  config: {
    approval_flow: ['Member', 'owner', 'admin']
  },
  setting: [{
    app: 'global',
    name: 'enable_approval',
    value: 'false',
    type: 'boolean'
  }, {
    app: 'approval',
    name: 'view.css',
    value: '',
    type: 'text'
  }]
};
