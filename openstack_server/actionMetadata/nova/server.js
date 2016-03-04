var novaRemote = require('config')('remote').nova;

var defaultMeta = {
  method      : 'post',
  remote      : novaRemote,
  type        : null,
  apiDir      : '/api/v1/:projectId/servers/:serverId/action/',
  dir         : '/v2.1/{tenant_id}/servers/{server_id}/action',
  actionKey   : '',
  actionValue : {},
  required    : [],
  optional    : [],
  oneOf       : [],
  urlParam    : ['project_id', 'server_id']
};

var metadata = {
  'create': {
    type      : 'create',
    apiDir    : '/api/v1/:projectId/servers/action/create',
    dir       : '/v2.1/{tenant_id}/servers',
    actionKey : 'server',
    required  : ['imageRef', 'flavorRef', 'name'],
    optional  : ['networks', 'metadata', 'personality', 'block_device_mapping_v2', 'guest_format', 'boot_index', 'config_drive', 'key_name', 'os:scheduler_hints', 'OS-DCF:diskConfig'],
    urlParam  : ['project_id']
  },
  'getVNCConsole': {
    type: 'vnc',
    actionKey: 'os-getVNCConsole',
    actionValue: {
      'type': 'novnc'
    }
  },
  'getConsoleOutput': {
    type: 'output',
    actionKey: 'os-getConsoleOutput',
    actionValue: {
      'length': -1
    }
  },
  'start': {
    type: 'start',
    actionKey: 'os-start',
    actionValue: null
  },
  'stop': {
    type: 'stop',
    actionKey: 'os-stop',
    actionValue: null
  },
  'restart': {
    type: 'restart',
    actionKey: 'reboot',
    actionValue: {
      'type': 'SOFT'
    }
  },
  'restartHard': {
    type: 'hrestart',
    actionKey: 'reboot',
    actionValue: {
      'type': 'HARD'
    }
  },
  'createSnapshot': {
    type: 'snapshot',
    actionKey: 'createImage',
    required: ['name']
  },
  'resize': {
    type: 'resize',
    actionKey: 'resize',
    required: ['flavorRef']
  },
  'resizeConfirm': {
    'type': 'resizeconfirm',
    actionKey: 'confirmResize',
    actionValue: null
  },
  'addFloatingip': {
    type: 'addfip',
    actionKey: 'addFloatingIp',
    required: ['address'],
    optional: ['fixed_address']
  },
  'removeFloatingip': {
    type: 'rmfip',
    actionKey: 'removeFloatingIp',
    required: ['address']
  },
  'joinNetwork': {
    type: 'joinnet',
    dir: '/v2.1/{tenant_id}/servers/{server_id}/os-interface',
    actionKey: 'interfaceAttachment',
    oneOf: ['port_id', 'net_id'],
    optional: ['fixed_ips']
  },
  'addSecurity': {
    type: 'addsecurity',
    actionKey: 'addSecurityGroup',
    required: ['name']
  },
  'removeSecurity': {
    type: 'rmsecurity',
    actionKey: 'removeSecurityGroup',
    required: ['name']
  },
  'changePass': {
    type: 'password',
    actionKey: 'changePassword',
    required: ['adminPass']
  },
  'attachVolume': {
    type: 'addvolume',
    dir: '/v2.1/{tenant_id}/servers/{server_id}/os-volume_attachments',
    actionKey: 'volumeAttachment',
    required: ['volume_id', 'device']
  },
  'detachVolume': {
    type: 'rmvolume',
    method: 'delete',
    dir: '/v2.1/{tenant_id}/servers/{server_id}/os-volume_attachments/{volume_id}',
    required: ['volume_id'],
    urlParam: ['project_id', 'server_id', 'volume_id']
  },
  'delete': {
    type: 'delete',
    method: 'delete',
    dir: '/v2.1/{tenant_id}/servers/{server_id}'
  },
  'altMeta': {
    type: 'editmeta',
    method: 'put',
    dir: '/v2.1/{tenant_id}/servers/{server_id}',
    actionKey: 'server',
    optional: ['name', 'imageRef', 'flavorRef']
  }
};

Object.defineProperty(metadata, 'default', {
  value        : defaultMeta,
  writable     : false,
  enumerable   : false,
  configurable : true
});

module.exports = metadata;
