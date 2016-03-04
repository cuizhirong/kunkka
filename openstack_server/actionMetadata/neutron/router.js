var neutronRemote = require('config')('remote').neutron;

var defaultMeta = {
  method      : 'post',
  remote      : neutronRemote,
  type        : null,
  apiDir      : '/api/v1/routers/:routerId/action/',
  dir         : '/v2.0/routers/{router_id}',
  actionKey   : 'router',
  actionValue : {},
  required    : [],
  optional    : [],
  oneOf       : [],
  urlParam    : ['router_id']
};

var metadata = {
  'routerCreate': {
    type     : 'create',
    apiDir   : '/api/v1/routers/action/',
    dir      : '/v2.0/routers',
    optional : ['name', 'external_gateway_info', 'enable_snat', 'external_fixed_ips', 'admin_state_up'],
    urlParam : []
  },
  'routerOpenExternal': {
    type     : 'openexternal',
    method   : 'put',
    required : ['external_gateway_info']
  },
  'routerCloseExternal': {
    type        : 'closeexternal',
    method      : 'put',
    actionValue : {'external_gateway_info' : null}
  },
  'routerSetFloatingip': {
    type     : 'setfloatingip',
    method   : 'put',
    required : ['external_gateway_info']
  },
  'routerBindSubnet': {
    type      : 'bindsubnet',
    method    : 'put',
    actionKey : '',
    dir       : '/v2.0/routers/{router_id}/add_router_interface',
    oneOf     : ['port_id', 'subnet_id']
  },
  'routerUnbindSubnet': {
    type      : 'unbindsubnet',
    method    : 'put',
    actionKey : '',
    dir       : '/v2.0/routers/{router_id}/remove_router_interface',
    oneOf     : ['port_id', 'subnet_id']
  },
  'routerDelete': {
    type      : 'delete',
    actionKey : '',
    method    : 'delete'
  }
};

Object.defineProperty(metadata, 'default', {
  value        : defaultMeta,
  writable     : false,
  enumerable   : false,
  configurable : true
});

module.exports = metadata;
