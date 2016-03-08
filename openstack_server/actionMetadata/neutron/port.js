var neutronRemote = require('config')('remote').neutron;
var novaRemote = require('config')('remote').nova;

var defaultMeta = {
  method      : 'post',
  remote      : neutronRemote,
  type        : null,
  apiDir      : '/api/v1/port/:portId/action/',
  dir         : '/v2.0/ports/{port_id}',
  actionKey   : 'port',
  actionValue : {},
  required    : [],
  optional    : [],
  oneOf       : [],
  urlParam    : ['port_id']
};

var metadata = {
  'portCreate': {
    type     : 'create',
    apiDir   : '/api/v1/port/action/',
    dir      : '/v2.0/ports',
    required : ['network_id'],
    optional : ['name', 'fixed_ips', 'security_groups', 'allowed_address_pairs', 'device_owner', 'device_id', 'mac_address'],
    urlParam : []
  },
  'portBindInstance': {
    type      : 'bindserver',
    remote    : novaRemote,
    dir       : '/v2.1/{tenant_id}/servers/{server_id}/os-interface',
    actionKey : 'interfaceAttachment',
    required  : ['project_id', 'server_id'],
    urlParam  : ['project_id', 'server_id']
  },
  'portUnbindInstance': {
    type      : 'unbindserver',
    remote    : novaRemote,
    method    : 'delete',
    dir       : '/v2.1/{tenant_id}/servers/{server_id}/os-interface/{port_id}',
    actionKey : '',
    required  : ['project_id', 'server_id'],
    urlParam  : ['project_id', 'server_id', 'port_id']
  },
  'portUpdateSecurity': {
    type     : 'updatesecurity',
    method   : 'put',
    required : ['security_groups']
  },
  'portDelete': {
    type   : 'delete',
    method : 'delete'
  },
  'portOpenSecurity': {
    type        : 'opensecurity',
    method      : 'put',
    actionValue : { 'port_security_enabled': true }
  },
  'portCloseSecurity': {
    type        : 'closesecurity',
    method      : 'put',
    actionValue : { 'port_security_enabled': false }
  }
};

Object.defineProperty(metadata, 'default', {
  value        : defaultMeta,
  writable     : false,
  enumerable   : false,
  configurable : true
});

module.exports = metadata;
