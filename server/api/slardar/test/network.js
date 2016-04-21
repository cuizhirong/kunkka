module.exports = {
  // name: 'network',
  path: 'neutron/network.js',
  test: {
    getNetworkList: {
      path: '/api/v1/networks',
      input: {},
      output: {
        'networks': [
          {
            'status': 'ACTIVE',
            'subnets': [
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
          {
            'status': 'ACTIVE',
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
                'subnetpool_id': null
              }
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
          {
            'status': 'ACTIVE',
            'subnets': [
              'c4bb968f-581c-4879-bf1e-965263c3c220',
              'f4f7325e-5520-4044-b2e7-ba91571a91bc'
            ],
            'name': 'CHINATELECOM',
            'admin_state_up': true,
            'tenant_id': '4a73eeb4cda14804a722bf254e900682',
            'mtu': 0,
            'router:external': true,
            'shared': false,
            'port_security_enabled': true,
            'id': 'e6e3d527-301f-4596-ad4b-cc29d99ca567'
          }
        ]
      }
    },
    getNetworkDetails: {
      path: '/api/v1/networks/:networkId',
      input: {},
      output: {
        'network': {
          'status': 'ACTIVE',
          'subnets': [
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
          ],
          'name': '龙鹏-public-network',
          'admin_state_up': true,
          'tenant_id': 'b484b27774144a8d8d1c2d49bf85370d',
          'mtu': 0,
          'router:external': false,
          'shared': false,
          'port_security_enabled': true,
          'id': '17472643-23e2-440f-b3ca-d6b5e2a756cd'
        }
      }
    }
  }
};
