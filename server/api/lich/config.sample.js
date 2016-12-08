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
    type: 'boolean',
    description: '开启审批功能'
  }, {
    app: 'approval',
    name: 'view.css',
    value: '',
    type: 'text',
    description: '审批面板-样式定制'
  }, {
    app: 'approval',
    name: 'appliable_volume_types',
    value: '["ssd", "capacity"]',
    type: 'string',
    description: '审批面板-允许申请的云硬盘类型'
  }, {
    app: 'approval',
    name: 'enable_apply_instance_credential',
    value: 'true',
    type: 'boolean',
    description: '审批面板-允许用户设置虚拟机秘密'
  }, {
    app: 'approval',
    name: 'enable_apply_instance_name',
    value: 'true',
    type: 'boolean',
    description: '审批面板-允许用户设置虚拟机名称'
  }, {
    app: 'approval',
    name: 'server_name_prefix',
    value: 'op',
    type: 'string',
    description: '审批面板-虚拟机名称前缀'
  }]
};
