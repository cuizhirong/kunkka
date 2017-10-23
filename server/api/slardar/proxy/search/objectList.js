'use strict';

const objects = [
  {
    name: 'hypervisor', re: /\/nova\/v2.1\/[a-z0-9]*\/os-hypervisors\/detail/i,
    hasPagination: false, service: 'nova', version: 'v2.1',
    match: 'hypervisor_hostname'
  },
  {
    name: 'server', re: /\/nova\/v2.1\/[a-z0-9]*\/servers\/detail/i,
    hasPagination: true, service: 'nova', version: 'v2.1'
  },
  {
    name: 'flavor', re: /\/nova\/v2.1\/[a-z0-9]*\/flavors\/detail/i,
    hasPagination: true, service: 'nova', version: 'v2.1'
  },
  {
    name: 'image', re: /\/glance\/v2\/images/i,
    hasPagination: true, linkKey: null, service: 'glance', version: 'v2', singleKey: false
  },
  {
    name: 'volume', re: /\/cinder\/v2\/[a-z0-9]*\/volumes\/detail/i,
    hasPagination: true, service: 'cinder', version: 'v2'
  },
  {
    name: 'snapshot', re: /\/cinder\/v2\/[a-z0-9]*\/snapshots\/detail/i,
    hasPagination: true, service: 'cinder', version: 'v2'
  },
  {
    name: 'floatingip', re: /\/neutron\/v2.0\/floatingips/i,
    hasPagination: true, service: 'neutron', version: 'v2.0',
    match: 'floating_ip_address'
  },
  {
    name: 'port', re: /\/neutron\/v2.0\/ports/i,
    hasPagination: true, service: 'neutron', version: 'v2.0'
  },
  {
    name: 'network', re: /\/neutron\/v2.0\/networks/i,
    hasPagination: true, service: 'neutron', version: 'v2.0',
    match: 'name', networkHandler: true
  },
  {
    name: 'subnet', re: /\/neutron\/v2.0\/subnets/i,
    hasPagination: true, service: 'neutron', version: 'v2.0',
    match: 'name', networkHandler: true
  },
  {
    name: 'router', re: /\/neutron\/v2.0\/routers/i,
    hasPagination: true, service: 'neutron', version: 'v2.0',
    match: 'name', networkHandler: true
  },
  {
    name: 'domain', re: /\/keystone\/v3\/domains/i,
    hasPagination: false, service: 'keystone', version: 'v3'
  },
  {
    name: 'project', re: /\/keystone\/v3\/projects/i,
    hasPagination: false, service: 'keystone', version: 'v3'
  },
  {
    name: 'user', re: /\/keystone\/v3\/users/i,
    hasPagination: false, service: 'keystone', version: 'v3'
  },
  {
    name: 'group', re: /\/keystone\/v3\/groups/i,
    hasPagination: false, service: 'keystone', version: 'v3'
  },
  {
    name: 'role', re: /\/keystone\/v3\/roles/i,
    hasPagination: false, service: 'keystone', version: 'v3'
  }
];

module.exports = objects;
