var neutronRemote = require('config')('remote').neutron;
var novaRemote = require('config')('remote').nova;

var defaultMeta = {
  method      : 'post',
  remote      : neutronRemote,
  type        : null,
  apiDir      : '/api/v1/subnets/:subnetId/action/',
  dir         : '/v2.0/subnets/{subnet_id}',
  actionKey   : 'subnet',
  actionValue : {},
  required    : [],
  optional    : [],
  oneOf       : [],
  urlParam    : ['subnet_id']
};

var metadata = {
  'createSubnet': {
    type      : 'create',
    apiDir    : '/api/v1/subnets/action/',
    dir       : '/v2.0/subnets',
    actionKey : 'subnet',
    required  : ['network_id', 'ip_version', 'cidr'],
    optional  : ['name', 'allocation_pools ', 'start', 'end', 'gateway_ip', 'enable_dhcp ', 'dns_nameservers', 'host_routes', 'destination', 'nexthop', 'ipv6_ra_mode', 'ipv6_address_mode']
  },
  'subnetBindRouter': {
    type      : 'bindrouter',
    method    : 'put',
    dir       : '/v2.0/routers/{router_id}/add_router_interface',
    actionKey : '',
    required  : ['router_id'],
    urlParam  : ['router_id']
  },
  'subnetUnbindRouter': {
    type      : 'unbindrouter',
    method    : 'put',
    dir       : '/v2.0/routers/{router_id}/remove_router_interface',
    actionKey : '',
    required  : ['router_id'],
    urlParam  : ['router_id']
  },
  'subnetAddInstance': {
    type      : 'addserver',
    remote    : novaRemote,
    dir       : '/v2.1/{tenant_id}/servers/{server_id}/os-interface',
    actionKey : 'interfaceAttachment',
    required  : ['project_id', 'server_id', 'net_id', 'fixed_ips'],
    urlParam  : ['project_id', 'server_id']
  },
  'subnetUpdate': {
    type     : 'update',
    method   : 'put',
    optional : ['name', 'allocation_pools', 'start', 'end', 'gateway_ip', 'enable_dhcp', 'dns_nameservers', 'host_routes', 'destination', 'nexthop']
  },
  'subnetDelete': {
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
