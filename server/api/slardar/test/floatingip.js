module.exports = {
  // name: 'floatingip',
  path: 'neutron/floatingip.js',
  test: {
    getFloatingipList: {
      path: '/api/v1/:projectId/floatingips',
      in: '',
      out: {
        'floatingips': [
          {
            'floating_network_id': 'e6e3d527-301f-4596-ad4b-cc29d99ca567',
            'router_id': '9a635f3e-c721-4cce-86a1-8035bbda8541',
            'fixed_ip_address': '10.0.0.5',
            'floating_ip_address': '240.1.100.199',
            'tenant_id': 'b484b27774144a8d8d1c2d49bf85370d',
            'status': 'DOWN',
            'port_id': 'bd70cc6c-4858-473c-a568-2745dcb79d6d',
            'id': 'bdb79b21-8081-4b73-8fa2-4ec3f0bb1ecf',
            'association': {
              'type': 'server',
              'device': {
                'status': 'ACTIVE',
                'updated': '2016-04-18T03:58:39Z',
                'hostId': '88323f09ecac365445a9902739fd7758e600a3cd509cf6bb5226d0a2',
                'addresses': {
                  'shared': [
                    {
                      'OS-EXT-IPS-MAC:mac_addr': 'fa:16:3e:de:e4:b0',
                      'version': 4,
                      'addr': '192.168.0.61',
                      'OS-EXT-IPS:type': 'fixed'
                    }
                  ],
                  '龙鹏-public-network': [
                    {
                      'OS-EXT-IPS-MAC:mac_addr': 'fa:16:3e:de:fa:d0',
                      'version': 4,
                      'addr': '10.0.0.5',
                      'OS-EXT-IPS:type': 'fixed'
                    },
                    {
                      'OS-EXT-IPS-MAC:mac_addr': 'fa:16:3e:de:fa:d0',
                      'version': 4,
                      'addr': '240.1.100.199',
                      'OS-EXT-IPS:type': 'floating'
                    }
                  ]
                },
                'links': [
                  {
                    'href': 'http://42.62.93.98:8774/v2.1/b484b27774144a8d8d1c2d49bf85370d/servers/2d99ece4-2064-4a41-bde0-3b047a0e3513',
                    'rel': 'self'
                  },
                  {
                    'href': 'http://42.62.93.98:8774/b484b27774144a8d8d1c2d49bf85370d/servers/2d99ece4-2064-4a41-bde0-3b047a0e3513',
                    'rel': 'bookmark'
                  }
                ],
                'key_name': 'longpeng-keypair',
                'image': {
                  'id': 'c3fbabf3-8a1f-4420-95df-64ca4877d260',
                  'links': [
                    {
                      'href': 'http://42.62.93.98:8774/b484b27774144a8d8d1c2d49bf85370d/images/c3fbabf3-8a1f-4420-95df-64ca4877d260',
                      'rel': 'bookmark'
                    }
                  ]
                },
                'OS-EXT-STS:task_state': null,
                'OS-EXT-STS:vm_state': 'active',
                'OS-SRV-USG:launched_at': '2016-04-18T03:41:43.000000',
                'flavor': {
                  'id': '1',
                  'links': [
                    {
                      'href': 'http://42.62.93.98:8774/b484b27774144a8d8d1c2d49bf85370d/flavors/1',
                      'rel': 'bookmark'
                    }
                  ]
                },
                'id': '2d99ece4-2064-4a41-bde0-3b047a0e3513',
                'security_groups': [
                  {
                    'name': 'default'
                  },
                  {
                    'name': 'default'
                  }
                ],
                'OS-SRV-USG:terminated_at': null,
                'OS-EXT-AZ:availability_zone': 'nova',
                'user_id': 'b8c58306461947d19b94ecb17e99e3f7',
                'name': '龙鹏-server',
                'created': '2016-04-18T03:41:41Z',
                'tenant_id': 'b484b27774144a8d8d1c2d49bf85370d',
                'OS-DCF:diskConfig': 'MANUAL',
                'os-extended-volumes:volumes_attached': [
                  {
                    'id': 'c6418aa4-7227-4c1a-9423-3bad2b7e55ba'
                  }
                ],
                'accessIPv4': '',
                'accessIPv6': '',
                'progress': 0,
                'OS-EXT-STS:power_state': 1,
                'config_drive': '',
                'metadata': {}
              }
            }
          },
          {
            'floating_network_id': 'e6e3d527-301f-4596-ad4b-cc29d99ca567',
            'router_id': '9a635f3e-c721-4cce-86a1-8035bbda8541',
            'fixed_ip_address': '10.0.0.2',
            'floating_ip_address': '240.1.100.99',
            'tenant_id': 'b484b27774144a8d8d1c2d49bf85370d',
            'status': 'DOWN',
            'port_id': '22b2564c-8bd1-48d5-a060-36dcfed4f754',
            'id': 'bdb79b21-8081-4b73-8fa2-4ec3f0bb1ecf',
            'association': {
              'type': 'router',
              'device': {
                'status': 'ACTIVE',
                'external_gateway_info': {
                  'network_id': 'e6e3d527-301f-4596-ad4b-cc29d99ca567',
                  'enable_snat': true,
                  'external_fixed_ips': [
                    {
                      'subnet_id': 'c4bb968f-581c-4879-bf1e-965263c3c220',
                      'ip_address': '240.1.100.200'
                    }
                  ]
                },
                'name': '龙鹏-router',
                'admin_state_up': true,
                'tenant_id': 'b484b27774144a8d8d1c2d49bf85370d',
                'routes': [],
                'id': '9a635f3e-c721-4cce-86a1-8035bbda8541'
              }
            }
          }
        ]
      }
    },
    getFloatingipDetails: {
      path: '/api/v1/:projectId/floatingips/:floatingipId',
      in: '',
      out: {
        'floatingip': {
          'floating_network_id': 'e6e3d527-301f-4596-ad4b-cc29d99ca567',
          'router_id': '9a635f3e-c721-4cce-86a1-8035bbda8541',
          'fixed_ip_address': '10.0.0.5',
          'floating_ip_address': '240.1.100.199',
          'tenant_id': 'b484b27774144a8d8d1c2d49bf85370d',
          'status': 'DOWN',
          'port_id': 'bd70cc6c-4858-473c-a568-2745dcb79d6d',
          'id': 'bdb79b21-8081-4b73-8fa2-4ec3f0bb1ecf',
          'association': {
            'type': 'server',
            'device': {
              'status': 'ACTIVE',
              'updated': '2016-04-18T03:58:39Z',
              'hostId': '88323f09ecac365445a9902739fd7758e600a3cd509cf6bb5226d0a2',
              'addresses': {
                'shared': [
                  {
                    'OS-EXT-IPS-MAC:mac_addr': 'fa:16:3e:de:e4:b0',
                    'version': 4,
                    'addr': '192.168.0.61',
                    'OS-EXT-IPS:type': 'fixed'
                  }
                ],
                '龙鹏-public-network': [
                  {
                    'OS-EXT-IPS-MAC:mac_addr': 'fa:16:3e:de:fa:d0',
                    'version': 4,
                    'addr': '10.0.0.5',
                    'OS-EXT-IPS:type': 'fixed'
                  },
                  {
                    'OS-EXT-IPS-MAC:mac_addr': 'fa:16:3e:de:fa:d0',
                    'version': 4,
                    'addr': '240.1.100.199',
                    'OS-EXT-IPS:type': 'floating'
                  }
                ]
              },
              'links': [
                {
                  'href': 'http://42.62.93.98:8774/v2.1/b484b27774144a8d8d1c2d49bf85370d/servers/2d99ece4-2064-4a41-bde0-3b047a0e3513',
                  'rel': 'self'
                },
                {
                  'href': 'http://42.62.93.98:8774/b484b27774144a8d8d1c2d49bf85370d/servers/2d99ece4-2064-4a41-bde0-3b047a0e3513',
                  'rel': 'bookmark'
                }
              ],
              'key_name': 'longpeng-keypair',
              'image': {
                'id': 'c3fbabf3-8a1f-4420-95df-64ca4877d260',
                'links': [
                  {
                    'href': 'http://42.62.93.98:8774/b484b27774144a8d8d1c2d49bf85370d/images/c3fbabf3-8a1f-4420-95df-64ca4877d260',
                    'rel': 'bookmark'
                  }
                ]
              },
              'OS-EXT-STS:task_state': null,
              'OS-EXT-STS:vm_state': 'active',
              'OS-SRV-USG:launched_at': '2016-04-18T03:41:43.000000',
              'flavor': {
                'id': '1',
                'links': [
                  {
                    'href': 'http://42.62.93.98:8774/b484b27774144a8d8d1c2d49bf85370d/flavors/1',
                    'rel': 'bookmark'
                  }
                ]
              },
              'id': '2d99ece4-2064-4a41-bde0-3b047a0e3513',
              'security_groups': [
                {
                  'name': 'default'
                },
                {
                  'name': 'default'
                }
              ],
              'OS-SRV-USG:terminated_at': null,
              'OS-EXT-AZ:availability_zone': 'nova',
              'user_id': 'b8c58306461947d19b94ecb17e99e3f7',
              'name': '龙鹏-server',
              'created': '2016-04-18T03:41:41Z',
              'tenant_id': 'b484b27774144a8d8d1c2d49bf85370d',
              'OS-DCF:diskConfig': 'MANUAL',
              'os-extended-volumes:volumes_attached': [
                {
                  'id': 'c6418aa4-7227-4c1a-9423-3bad2b7e55ba'
                }
              ],
              'accessIPv4': '',
              'accessIPv6': '',
              'progress': 0,
              'OS-EXT-STS:power_state': 1,
              'config_drive': '',
              'metadata': {}
            }
          }
        }
      }
    }
  }
};
