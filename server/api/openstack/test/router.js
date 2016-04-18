module.exports = {
  // name: 'router',
  path: 'neutron/router.js',
  test: {
    getRouterList: {
      path: '/api/v1/routers',
      in: '',
      out: {
        'routers': [
          {
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
            'id': '9a635f3e-c721-4cce-86a1-8035bbda8541',
            'floatingip': {
              'floating_network_id': 'e6e3d527-301f-4596-ad4b-cc29d99ca567',
              'router_id': '9a635f3e-c721-4cce-86a1-8035bbda8541',
              'fixed_ip_address': '10.0.0.2',
              'floating_ip_address': '240.1.100.99',
              'tenant_id': 'b484b27774144a8d8d1c2d49bf85370d',
              'status': 'DOWN',
              'port_id': '22b2564c-8bd1-48d5-a060-36dcfed4f754',
              'id': 'bdb79b21-8081-4b73-8fa2-4ec3f0bb1ecf'
            },
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
                'subnetpool_id': null
              }
            ]
          }
        ]
      }
    },
    getRouterDetails: {
      path: '/api/v1/routers/:routerId',
      in: '',
      out: {
        'routers': {
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
          'id': '9a635f3e-c721-4cce-86a1-8035bbda8541',
          'floatingip': {
            'floating_network_id': 'e6e3d527-301f-4596-ad4b-cc29d99ca567',
            'router_id': '9a635f3e-c721-4cce-86a1-8035bbda8541',
            'fixed_ip_address': '10.0.0.2',
            'floating_ip_address': '240.1.100.99',
            'tenant_id': 'b484b27774144a8d8d1c2d49bf85370d',
            'status': 'DOWN',
            'port_id': '22b2564c-8bd1-48d5-a060-36dcfed4f754',
            'id': 'bdb79b21-8081-4b73-8fa2-4ec3f0bb1ecf'
          },
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
              'subnetpool_id': null
            }
          ]
        }
      }
    }
  }
};
