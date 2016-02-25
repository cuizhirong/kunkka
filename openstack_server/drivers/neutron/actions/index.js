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
    required : ['network_id'],
    urlParam : ['network_id']
  },
  'bindRouter': { // for subnet
    method   : 'put',
    dir      : '/v2.0/routers/{router_id}/add_router_interface',
    required : ['router_id'],
    oneOf    : ['port_id', 'subnet_id'],
    urlParam : ['router_id']
  },
  'unbindRouter': { // for subnet
    method   : 'put',
    dir      : '/v2.0/routers/{router_id}/remove_router_interface',
    required : ['router_id'],
    oneOf    : ['port_id', 'subnet_id'],
    urlParam : ['router_id']
  },
  'addInstance': { // for subnet
    remote    : novaRemote,
    dir       : '/v2.1/{tenant_id}/servers/{server_id}/os-interface',
    actionKey : 'interfaceAttachment',
    required  : ['project_id', 'server_id'],
    oneOf     : ['port_id', 'net_id'],
    optional  : ['fixed_ips'],
    urlParam  : ['project_id', 'server_id']
  },
  'updateSubnet': { // for subnet
    method    : 'put',
    dir       : '/v2.0/subnets/{subnet_id}',
    actionKey : 'subnet',
    required  : ['subnet_id'],
    urlParam  : ['subnet_id'],
    optional  : ['name', 'allocation_pools', 'start', 'end', 'gateway_ip', 'enable_dhcp', 'dns_nameservers', 'host_routes', 'destination', 'nexthop']
  },
  'deleteSubnet': { // for subnet
    method   : 'delete',
    dir      : '/v2.0/subnets/{subnet_id}',
    required : ['subnet_id'],
    urlParam : ['subnet_id']
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
