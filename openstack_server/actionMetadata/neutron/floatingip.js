var neutronRemote = require('config')('remote').neutron;

var defaultMeta = {
  method      : 'post',
  remote      : neutronRemote,
  type        : null,
  apiDir      : '/api/v1/floatingips/:floatingipId/action/',
  dir         : '/v2.0/floatingips/{floatingip_id}',
  actionKey   : 'floatingip',
  actionValue : {},
  required    : [],
  optional    : [],
  oneOf       : [],
  urlParam    : ['floatingip_id']
};

var metadata = {
  'floatingipCreate': {
    type     : 'create',
    apiDir   : '/api/v1/floatingips/action/',
    dir      : '/v2.0/floatingips',
    required : ['floating_network_id'],
    optional : ['fixed_ip_address', 'floating_ip_address', 'prot_id'],
    urlParam : []
  },
  'floatingipBindInstance': {
    type     : 'bindserver',
    method   : 'put',
    required : ['port_id']
  },
  'floatingipUnbind': {
    type        : 'bindrouter',
    method      : 'put',
    actionValue : {'port_id': null}
  },
  'floatingipDelete': {
    type      : 'delete',
    method    : 'delete',
    actionKey : ''
  }
};

Object.defineProperty(metadata, 'default', {
  value        : defaultMeta,
  writable     : false,
  enumerable   : false,
  configurable : true
});

module.exports = metadata;
