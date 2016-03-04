var neutronRemote = require('config')('remote').neutron;

var defaultMeta = {
  method      : 'post',
  remote      : neutronRemote,
  type        : null,
  apiDir      : '/api/v1/networks/:networkId/action/',
  dir         : '/v2.0/networks/{network_id}',
  actionKey   : '',
  actionValue : {},
  required    : [],
  optional    : [],
  oneOf       : [],
  urlParam    : ['network_id']
};

var metadata = {
  'createNetwork': {
    type      : 'create',
    dir       : '/v2.0/networks',
    apiDir    : '/api/v1/networks/action/',
    actionKey : 'network',
    optional  : ['admin_state_up', 'name', 'router:external', 'shared', 'tenant_id'],
    urlParam  : []
  },
  'createSubnet': {
    type      : 'createsubnet',
    dir       : '/v2.0/subnets',
    actionKey : 'subnet',
    required  : ['ip_version', 'cidr'],
    optional  : ['name', 'allocation_pools ', 'start', 'end', 'gateway_ip', 'enable_dhcp ', 'dns_nameservers', 'host_routes', 'destination', 'nexthop', 'ipv6_ra_mode', 'ipv6_address_mode'],
    urlParam  : []
  },
  'deleteNetwork': {
    type   : 'delete',
    method : 'delete'
  }
};

Object.defineProperty(metadata, 'default', {
  value        : defaultMeta,
  writable     : false,
  enumerable   : false,
  configurable : true
});

module.exports = metadata;
