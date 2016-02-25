var novaRemote = require('config')('remote').nova;
var Base = require('../../base');

// var attr = ['method', 'dir', 'actionKey', 'actionValue', 'required', 'optional', 'urlParam'];

var dicMeta = {
  'default': {
    method      : 'post',
    remote      : novaRemote,
    dir         : '/v2.1/{tenant_id}/servers/{server_id}/action',
    actionKey   : '',
    actionValue : {},
    required    : [],
    optional    : [],
    oneOf       : [],
    urlParam    : ['project_id', 'server_id']
  },
  'create': {
    dir       : '/v2.1/{tenant_id}/servers',
    actionKey : 'server',
    required  : ['imageRef', 'flavorRef', 'name'],
    optional  : ['networks'],
    urlParam  : ['project_id']
  },
  'getVNCConsole': {
    actionKey   : 'os-getVNCConsole',
    actionValue : {'type': 'novnc'}
  },
  'getConsoleOutput': {
    actionKey   : 'os-getConsoleOutput',
    actionValue : {'length': -1}
  },
  'start': {
    actionKey   : 'os-start',
    actionValue : null
  },
  'stop': {
    actionKey   : 'os-stop',
    actionValue : null
  },
  'restart': {
    actionKey   : 'reboot',
    actionValue : {'type': 'SOFT'}
  },
  'restartHard': {
    actionKey   : 'reboot',
    actionValue : {'type': 'HARD'}
  },
  'createSnapshot': {
    actionKey : 'createImage',
    required  : ['name']
  },
  'resize': {
    actionKey : 'resize',
    required  : ['flavorRef']
  },
  'addFloatingip': {
    actionKey : 'addFloatingIp',
    required  : ['address'],
    optional  : ['fixed_address']
  },
  'removeFloatingip': {
    actionKey : 'removeFloatingIp',
    required  : ['address']
  },
  'joinNetwork': {
    dir       : '/v2.1/{tenant_id}/servers/{server_id}/os-interface',
    actionKey : 'interfaceAttachment',
    oneOf     : ['port_id', 'net_id'],
    optional  : ['fixed_ips']
  },
  'addSecurity': {
    actionKey : 'addSecurityGroup',
    required  : ['name']
  },
  'removeSecurity': {
    actionKey : 'removeSecurityGroup',
    required  : ['name']
  },
  'changePass': {
    actionKey : 'changePassword',
    required  : ['adminPass']
  },
  'attachVolume': {
    dir       : '/v2.1/{tenant_id}/servers/{server_id}/os-volume_attachments',
    actionKey : 'volumeAttachment',
    required  : ['volume_id', 'device']
  },
  'detachVolume': {
    method   : 'delete',
    dir      : '/v2.1/{tenant_id}/servers/{server_id}/os-volume_attachments/{volume_id}',
    required : ['volume_id'],
    urlParam : ['project_id', 'server_id', 'volume_id']
  },
  'delete': {
    method : 'delete',
    dir    : '/v2.1/{tenant_id}/servers/{server_id}'
  },
  'altMeta': {
    method    : 'put',
    dir       : '/v2.1/{tenant_id}/servers/{server_id}',
    actionKey : 'server',
    optional  : ['name', 'imageRef', 'flavorRef']
  },
  'listAction': {
    method : 'get',
    dir    : '/v2.1/{tenant_id}/servers/{server_id}/os-instance-actions'
  }
};
Base.generateDicMeta(dicMeta);

module.exports = {
  meta: dicMeta,
  action: function(token, region, callback, action, objSend) {
    var meta = dicMeta[action];
    return Base.operation.apply(this, [meta.remote[region], meta, token, region, callback, action, objSend]);
  }
};
