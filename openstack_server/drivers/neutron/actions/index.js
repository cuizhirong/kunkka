var neutronRemote = require('config')('remote').neutron;
var novaRemote = require('config')('remote').nova;
var Base = require('../../base');

var dicMeta = {
  'default': {
    method      : 'post',
    remote      : neutronRemote,
    dir         : '/v2.0/networks',
    actionKey   : '',
    actionValue : {},
    required    : [],
    optional    : [],
    oneOf       : [],
    urlParam    : []
  },
  'createNetwork': {
    actionKey : 'network',
    optional  : ['admin_state_up', 'name', 'router:external', 'shared', 'tenant_id']
  },
  'createSubnet': {
    dir       : '/v2.0/subnets',
    actionKey : 'subnet',
    required  : ['network_id', 'ip_version', 'cidr'],
    optional  : ['name', 'allocation_pools ', 'start', 'end', 'gateway_ip', 'enable_dhcp ', 'dns_nameservers', 'host_routes', 'destination', 'nexthop', 'ipv6_ra_mode', 'ipv6_address_mode']
  },
  'deleteNetwork': {
    method   : 'delete',
    dir      : '/v2.0/networks/{network_id}',
    urlParam : ['network_id']
  },
  'subnetBindRouter': { // for subnet
    method   : 'put',
    dir      : '/v2.0/routers/{router_id}/add_router_interface',
    required : ['router_id'],
    urlParam : ['router_id']
  },
  'subnetUnbindRouter': { // for subnet
    method   : 'put',
    dir      : '/v2.0/routers/{router_id}/remove_router_interface',
    required : ['router_id'],
    urlParam : ['router_id']
  },
  'subnetAddInstance': { // for subnet
    remote    : novaRemote,
    dir       : '/v2.1/{tenant_id}/servers/{server_id}/os-interface',
    actionKey : 'interfaceAttachment',
    required  : ['project_id', 'server_id', 'net_id', 'fixed_ips'],
    urlParam  : ['project_id', 'server_id']
  },
  'subnetUpdateSubnet': { // for subnet
    method    : 'put',
    dir       : '/v2.0/subnets/{subnet_id}',
    actionKey : 'subnet',
    urlParam  : ['subnet_id'],
    optional  : ['name', 'allocation_pools', 'start', 'end', 'gateway_ip', 'enable_dhcp', 'dns_nameservers', 'host_routes', 'destination', 'nexthop']
  },
  'subnetDelete': { // for subnet
    method   : 'delete',
    dir      : '/v2.0/subnets/{subnet_id}',
    urlParam : ['subnet_id']
  },
  'createRouter': {
    dir       : '/v2.0/routers',
    actionKey : 'router',
    optional  : ['name', 'external_gateway_info', 'enable_snat', 'external_fixed_ips', 'admin_state_up']
  },
  'routerOpenExternal': {
    method    : 'put',
    dir       : '/v2.0/routers/{router_id}',
    actionKey : 'router',
    required  : ['external_gateway_info'],
    urlParam  : ['router_id']
  },
  'routerBindSubnet': {
    method   : 'put',
    dir      : '/v2.0/routers/{router_id}/add_router_interface',
    oneOf    : ['port_id', 'subnet_id'],
    urlParam : ['router_id']
  },
  'routerUnbindSubnet': {
    method   : 'put',
    dir      : '/v2.0/routers/{router_id}/remove_router_interface',
    oneOf    : ['port_id', 'subnet_id'],
    urlParam : ['router_id']
  },
  'routerDelete': {
    method   : 'delete',
    dir      : '/v2.0/routers/{router_id}',
    urlParam : ['router_id']
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
