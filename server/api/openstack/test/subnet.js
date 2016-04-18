module.exports = {
  // name: 'subnet',
  path: 'neutron/subnet.js',
  test: {
    getSubnetList: {
      path: '/api/v1/:projectId/subnets',
      in: '',
      out: {
        'subnets': [
          {
            'name': 'shared-subnet',
            'enable_dhcp': true,
            'network_id': '6b28196d-a1cb-44cd-aa9b-305894455aa1',
            'tenant_id': '4a73eeb4cda14804a722bf254e900682',
            'dns_nameservers': [],
            'gateway_ip': '192.168.0.1',
            'ipv6_ra_mode': null,
            'allocation_pools': [
              {
                'start': '192.168.0.2',
                'end': '192.168.0.254'
              }
            ],
            'host_routes': [],
            'ip_version': 4,
            'ipv6_address_mode': null,
            'cidr': '192.168.0.0/24',
            'id': '12ee17ef-eafe-4252-acd2-5dda405f9172',
            'subnetpool_id': null,
            'network': {
              'status': 'ACTIVE',
              'subnets': [
                '12ee17ef-eafe-4252-acd2-5dda405f9172'
              ],
              'name': 'shared',
              'admin_state_up': true,
              'tenant_id': '4a73eeb4cda14804a722bf254e900682',
              'mtu': 0,
              'router:external': false,
              'shared': true,
              'port_security_enabled': true,
              'id': '6b28196d-a1cb-44cd-aa9b-305894455aa1'
            },
            'ports': [
              {
                'status': 'ACTIVE',
                'name': '',
                'allowed_address_pairs': [],
                'admin_state_up': true,
                'network_id': '6b28196d-a1cb-44cd-aa9b-305894455aa1',
                'dns_name': '',
                'extra_dhcp_opts': [],
                'mac_address': 'fa:16:3e:de:e4:b0',
                'dns_assignment': [
                  {
                    'hostname': 'host-192-168-0-61',
                    'ip_address': '192.168.0.61',
                    'fqdn': 'host-192-168-0-61.openstacklocal.'
                  }
                ],
                'binding:vnic_type': 'normal',
                'device_owner': 'compute:None',
                'tenant_id': 'b484b27774144a8d8d1c2d49bf85370d',
                'port_security_enabled': true,
                'fixed_ips': [
                  {
                    'subnet_id': '12ee17ef-eafe-4252-acd2-5dda405f9172',
                    'ip_address': '192.168.0.61'
                  }
                ],
                'id': '6c4faab4-885c-46a7-be01-bfec3f3ed0e8',
                'security_groups': [
                  '12616a1e-8913-416d-ba28-34bc76c1718a'
                ],
                'device_id': '2d99ece4-2064-4a41-bde0-3b047a0e3513',
                'server': {
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
            ],
            'router': {}
          },
          {
            'name': '龙鹏-public-network-subnet',
            'enable_dhcp': true,
            'network_id': '17472643-23e2-440f-b3ca-d6b5e2a756cd',
            'tenant_id': 'b484b27774144a8d8d1c2d49bf85370d',
            'dns_nameservers': [],
            'gateway_ip': '10.0.0.1',
            'ipv6_ra_mode': null,
            'allocation_pools': [
              {
                'start': '10.0.0.2',
                'end': '10.0.0.254'
              }
            ],
            'host_routes': [],
            'ip_version': 4,
            'ipv6_address_mode': null,
            'cidr': '10.0.0.0/24',
            'id': 'bef300b7-61f4-4472-ad30-8aeaf85abe74',
            'subnetpool_id': null,
            'network': {
              'status': 'ACTIVE',
              'subnets': [
                'bef300b7-61f4-4472-ad30-8aeaf85abe74'
              ],
              'name': '龙鹏-public-network',
              'admin_state_up': true,
              'tenant_id': 'b484b27774144a8d8d1c2d49bf85370d',
              'mtu': 0,
              'router:external': false,
              'shared': false,
              'port_security_enabled': true,
              'id': '17472643-23e2-440f-b3ca-d6b5e2a756cd'
            },
            'ports': [
              {
                'status': 'ACTIVE',
                'name': '',
                'allowed_address_pairs': [],
                'admin_state_up': true,
                'network_id': '17472643-23e2-440f-b3ca-d6b5e2a756cd',
                'dns_name': '',
                'extra_dhcp_opts': [],
                'mac_address': 'fa:16:3e:5a:63:05',
                'dns_assignment': [
                  {
                    'hostname': 'host-10-0-0-2',
                    'ip_address': '10.0.0.2',
                    'fqdn': 'host-10-0-0-2.openstacklocal.'
                  }
                ],
                'binding:vnic_type': 'normal',
                'device_owner': 'network:router_gateway',
                'tenant_id': 'b484b27774144a8d8d1c2d49bf85370d',
                'port_security_enabled': false,
                'fixed_ips': [
                  {
                    'subnet_id': 'bef300b7-61f4-4472-ad30-8aeaf85abe74',
                    'ip_address': '10.0.0.2'
                  }
                ],
                'id': '22b2564c-8bd1-48d5-a060-36dcfed4f754',
                'security_groups': [],
                'device_id': '9a635f3e-c721-4cce-86a1-8035bbda8541'
              },
              {
                'status': 'ACTIVE',
                'name': '',
                'allowed_address_pairs': [],
                'admin_state_up': true,
                'network_id': '17472643-23e2-440f-b3ca-d6b5e2a756cd',
                'dns_name': '',
                'extra_dhcp_opts': [],
                'mac_address': 'fa:16:3e:15:24:02',
                'dns_assignment': [
                  {
                    'hostname': 'host-10-0-0-3',
                    'ip_address': '10.0.0.3',
                    'fqdn': 'host-10-0-0-3.openstacklocal.'
                  }
                ],
                'binding:vnic_type': 'normal',
                'device_owner': 'network:dhcp',
                'tenant_id': 'b484b27774144a8d8d1c2d49bf85370d',
                'port_security_enabled': true,
                'fixed_ips': [
                  {
                    'subnet_id': 'bef300b7-61f4-4472-ad30-8aeaf85abe74',
                    'ip_address': '10.0.0.3'
                  }
                ],
                'id': '26921667-7a37-4e9b-a627-bebfa4ae7e7b',
                'security_groups': [],
                'device_id': 'dhcp18df1b29-e7b9-556d-b7c2-3029ded28c3b-17472643-23e2-440f-b3ca-d6b5e2a756cd'
              },
              {
                'status': 'DOWN',
                'name': '',
                'allowed_address_pairs': [],
                'admin_state_up': true,
                'network_id': '17472643-23e2-440f-b3ca-d6b5e2a756cd',
                'dns_name': '',
                'extra_dhcp_opts': [],
                'mac_address': 'fa:16:3e:20:f9:19',
                'dns_assignment': [
                  {
                    'hostname': 'host-10-0-0-1',
                    'ip_address': '10.0.0.1',
                    'fqdn': 'host-10-0-0-1.openstacklocal.'
                  }
                ],
                'binding:vnic_type': 'normal',
                'device_owner': 'network:router_interface',
                'tenant_id': 'b484b27774144a8d8d1c2d49bf85370d',
                'port_security_enabled': false,
                'fixed_ips': [
                  {
                    'subnet_id': 'bef300b7-61f4-4472-ad30-8aeaf85abe74',
                    'ip_address': '10.0.0.1'
                  }
                ],
                'id': '533ad6e9-9253-473d-8073-da9fe18736de',
                'security_groups': [],
                'device_id': '9a635f3e-c721-4cce-86a1-8035bbda8541'
              },
              {
                'status': 'ACTIVE',
                'name': '',
                'allowed_address_pairs': [],
                'admin_state_up': true,
                'network_id': '17472643-23e2-440f-b3ca-d6b5e2a756cd',
                'dns_name': '',
                'extra_dhcp_opts': [],
                'mac_address': 'fa:16:3e:a2:a4:d0',
                'dns_assignment': [
                  {
                    'hostname': 'host-10-0-0-4',
                    'ip_address': '10.0.0.4',
                    'fqdn': 'host-10-0-0-4.openstacklocal.'
                  }
                ],
                'binding:vnic_type': 'normal',
                'device_owner': 'network:dhcp',
                'tenant_id': 'b484b27774144a8d8d1c2d49bf85370d',
                'port_security_enabled': true,
                'fixed_ips': [
                  {
                    'subnet_id': 'bef300b7-61f4-4472-ad30-8aeaf85abe74',
                    'ip_address': '10.0.0.4'
                  }
                ],
                'id': '68bd6a3f-248e-4d58-a587-26ba64bebb9d',
                'security_groups': [],
                'device_id': 'dhcpb7c8c39d-a564-5e08-8683-a7b37ebcc8ea-17472643-23e2-440f-b3ca-d6b5e2a756cd'
              },
              {
                'status': 'ACTIVE',
                'name': '',
                'allowed_address_pairs': [],
                'admin_state_up': true,
                'network_id': '17472643-23e2-440f-b3ca-d6b5e2a756cd',
                'dns_name': '',
                'extra_dhcp_opts': [],
                'mac_address': 'fa:16:3e:de:fa:d0',
                'dns_assignment': [
                  {
                    'hostname': 'host-10-0-0-5',
                    'ip_address': '10.0.0.5',
                    'fqdn': 'host-10-0-0-5.openstacklocal.'
                  }
                ],
                'binding:vnic_type': 'normal',
                'device_owner': 'compute:None',
                'tenant_id': 'b484b27774144a8d8d1c2d49bf85370d',
                'port_security_enabled': true,
                'fixed_ips': [
                  {
                    'subnet_id': 'bef300b7-61f4-4472-ad30-8aeaf85abe74',
                    'ip_address': '10.0.0.5'
                  }
                ],
                'id': 'bd70cc6c-4858-473c-a568-2745dcb79d6d',
                'security_groups': [
                  '12616a1e-8913-416d-ba28-34bc76c1718a'
                ],
                'device_id': '2d99ece4-2064-4a41-bde0-3b047a0e3513',
                'server': {
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
            ],
            'router': {
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
        ]
      }
    },
    getSubnetDetails: {
      path: '/api/v1/:projectId/subnets/:subnetId',
      in: '',
      out: {
        'subnet': {
          'name': '龙鹏-public-network-subnet',
          'enable_dhcp': true,
          'network_id': '17472643-23e2-440f-b3ca-d6b5e2a756cd',
          'tenant_id': 'b484b27774144a8d8d1c2d49bf85370d',
          'dns_nameservers': [],
          'gateway_ip': '10.0.0.1',
          'ipv6_ra_mode': null,
          'allocation_pools': [
            {
              'start': '10.0.0.2',
              'end': '10.0.0.254'
            }
          ],
          'host_routes': [],
          'ip_version': 4,
          'ipv6_address_mode': null,
          'cidr': '10.0.0.0/24',
          'id': 'bef300b7-61f4-4472-ad30-8aeaf85abe74',
          'subnetpool_id': null,
          'network': {
            'status': 'ACTIVE',
            'subnets': [
              'bef300b7-61f4-4472-ad30-8aeaf85abe74'
            ],
            'name': '龙鹏-public-network',
            'admin_state_up': true,
            'tenant_id': 'b484b27774144a8d8d1c2d49bf85370d',
            'mtu': 0,
            'router:external': false,
            'shared': false,
            'port_security_enabled': true,
            'id': '17472643-23e2-440f-b3ca-d6b5e2a756cd'
          },
          'ports': [
            {
              'status': 'ACTIVE',
              'name': '',
              'allowed_address_pairs': [],
              'admin_state_up': true,
              'network_id': '17472643-23e2-440f-b3ca-d6b5e2a756cd',
              'dns_name': '',
              'extra_dhcp_opts': [],
              'mac_address': 'fa:16:3e:5a:63:05',
              'dns_assignment': [
                {
                  'hostname': 'host-10-0-0-2',
                  'ip_address': '10.0.0.2',
                  'fqdn': 'host-10-0-0-2.openstacklocal.'
                }
              ],
              'binding:vnic_type': 'normal',
              'device_owner': 'network:router_gateway',
              'tenant_id': 'b484b27774144a8d8d1c2d49bf85370d',
              'port_security_enabled': false,
              'fixed_ips': [
                {
                  'subnet_id': 'bef300b7-61f4-4472-ad30-8aeaf85abe74',
                  'ip_address': '10.0.0.2'
                }
              ],
              'id': '22b2564c-8bd1-48d5-a060-36dcfed4f754',
              'security_groups': [],
              'device_id': '9a635f3e-c721-4cce-86a1-8035bbda8541'
            },
            {
              'status': 'ACTIVE',
              'name': '',
              'allowed_address_pairs': [],
              'admin_state_up': true,
              'network_id': '17472643-23e2-440f-b3ca-d6b5e2a756cd',
              'dns_name': '',
              'extra_dhcp_opts': [],
              'mac_address': 'fa:16:3e:15:24:02',
              'dns_assignment': [
                {
                  'hostname': 'host-10-0-0-3',
                  'ip_address': '10.0.0.3',
                  'fqdn': 'host-10-0-0-3.openstacklocal.'
                }
              ],
              'binding:vnic_type': 'normal',
              'device_owner': 'network:dhcp',
              'tenant_id': 'b484b27774144a8d8d1c2d49bf85370d',
              'port_security_enabled': true,
              'fixed_ips': [
                {
                  'subnet_id': 'bef300b7-61f4-4472-ad30-8aeaf85abe74',
                  'ip_address': '10.0.0.3'
                }
              ],
              'id': '26921667-7a37-4e9b-a627-bebfa4ae7e7b',
              'security_groups': [],
              'device_id': 'dhcp18df1b29-e7b9-556d-b7c2-3029ded28c3b-17472643-23e2-440f-b3ca-d6b5e2a756cd'
            },
            {
              'status': 'DOWN',
              'name': '',
              'allowed_address_pairs': [],
              'admin_state_up': true,
              'network_id': '17472643-23e2-440f-b3ca-d6b5e2a756cd',
              'dns_name': '',
              'extra_dhcp_opts': [],
              'mac_address': 'fa:16:3e:20:f9:19',
              'dns_assignment': [
                {
                  'hostname': 'host-10-0-0-1',
                  'ip_address': '10.0.0.1',
                  'fqdn': 'host-10-0-0-1.openstacklocal.'
                }
              ],
              'binding:vnic_type': 'normal',
              'device_owner': 'network:router_interface',
              'tenant_id': 'b484b27774144a8d8d1c2d49bf85370d',
              'port_security_enabled': false,
              'fixed_ips': [
                {
                  'subnet_id': 'bef300b7-61f4-4472-ad30-8aeaf85abe74',
                  'ip_address': '10.0.0.1'
                }
              ],
              'id': '533ad6e9-9253-473d-8073-da9fe18736de',
              'security_groups': [],
              'device_id': '9a635f3e-c721-4cce-86a1-8035bbda8541'
            },
            {
              'status': 'ACTIVE',
              'name': '',
              'allowed_address_pairs': [],
              'admin_state_up': true,
              'network_id': '17472643-23e2-440f-b3ca-d6b5e2a756cd',
              'dns_name': '',
              'extra_dhcp_opts': [],
              'mac_address': 'fa:16:3e:a2:a4:d0',
              'dns_assignment': [
                {
                  'hostname': 'host-10-0-0-4',
                  'ip_address': '10.0.0.4',
                  'fqdn': 'host-10-0-0-4.openstacklocal.'
                }
              ],
              'binding:vnic_type': 'normal',
              'device_owner': 'network:dhcp',
              'tenant_id': 'b484b27774144a8d8d1c2d49bf85370d',
              'port_security_enabled': true,
              'fixed_ips': [
                {
                  'subnet_id': 'bef300b7-61f4-4472-ad30-8aeaf85abe74',
                  'ip_address': '10.0.0.4'
                }
              ],
              'id': '68bd6a3f-248e-4d58-a587-26ba64bebb9d',
              'security_groups': [],
              'device_id': 'dhcpb7c8c39d-a564-5e08-8683-a7b37ebcc8ea-17472643-23e2-440f-b3ca-d6b5e2a756cd'
            },
            {
              'status': 'ACTIVE',
              'name': '',
              'allowed_address_pairs': [],
              'admin_state_up': true,
              'network_id': '17472643-23e2-440f-b3ca-d6b5e2a756cd',
              'dns_name': '',
              'extra_dhcp_opts': [],
              'mac_address': 'fa:16:3e:de:fa:d0',
              'dns_assignment': [
                {
                  'hostname': 'host-10-0-0-5',
                  'ip_address': '10.0.0.5',
                  'fqdn': 'host-10-0-0-5.openstacklocal.'
                }
              ],
              'binding:vnic_type': 'normal',
              'device_owner': 'compute:None',
              'tenant_id': 'b484b27774144a8d8d1c2d49bf85370d',
              'port_security_enabled': true,
              'fixed_ips': [
                {
                  'subnet_id': 'bef300b7-61f4-4472-ad30-8aeaf85abe74',
                  'ip_address': '10.0.0.5'
                }
              ],
              'id': 'bd70cc6c-4858-473c-a568-2745dcb79d6d',
              'security_groups': [
                '12616a1e-8913-416d-ba28-34bc76c1718a'
              ],
              'device_id': '2d99ece4-2064-4a41-bde0-3b047a0e3513',
              'server': {
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
          ],
          'router': {
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
    }
  }
};
