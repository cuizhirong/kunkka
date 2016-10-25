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
  }, {
    app: 'approval',
    name: 'appliable_volume_types',
    value: '["ssd", "capacity"]',
    type: 'string'
  }, {
    app: 'approval',
    name: 'enable_apply_instance_credential',
    value: 'true',
    type: 'boolean'
  }, {
    app: 'approval',
    name: 'enable_apply_instance_name',
    value: 'true',
    type: 'boolean'
  }]
};
