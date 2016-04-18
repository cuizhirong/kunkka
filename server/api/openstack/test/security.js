module.exports = {
  // name: 'security',
  path: 'neutron/security.js',
  test: {
    getSecurityList: {
      path: '/api/v1/:projectId/security',
      in: '',
      out: {
        'security_groups': [
          {
            'tenant_id': 'b484b27774144a8d8d1c2d49bf85370d',
            'description': 'Default security group',
            'id': '12616a1e-8913-416d-ba28-34bc76c1718a',
            'security_group_rules': [
              {
                'remote_group_id': null,
                'direction': 'egress',
                'remote_ip_prefix': null,
                'protocol': null,
                'ethertype': 'IPv6',
                'tenant_id': 'b484b27774144a8d8d1c2d49bf85370d',
                'port_range_max': null,
                'port_range_min': null,
                'id': '0ab81392-362b-4d4e-940f-c9f5a9da3a25',
                'security_group_id': '12616a1e-8913-416d-ba28-34bc76c1718a'
              },
              {
                'remote_group_id': '12616a1e-8913-416d-ba28-34bc76c1718a',
                'direction': 'ingress',
                'remote_ip_prefix': null,
                'protocol': null,
                'ethertype': 'IPv6',
                'tenant_id': 'b484b27774144a8d8d1c2d49bf85370d',
                'port_range_max': null,
                'port_range_min': null,
                'id': '12007527-97f1-4d96-a11a-b3b94206d686',
                'security_group_id': '12616a1e-8913-416d-ba28-34bc76c1718a'
              },
              {
                'remote_group_id': null,
                'direction': 'egress',
                'remote_ip_prefix': null,
                'protocol': null,
                'ethertype': 'IPv4',
                'tenant_id': 'b484b27774144a8d8d1c2d49bf85370d',
                'port_range_max': null,
                'port_range_min': null,
                'id': '2a3baa1e-2d44-4632-9a23-6b00921fdcf8',
                'security_group_id': '12616a1e-8913-416d-ba28-34bc76c1718a'
              },
              {
                'remote_group_id': '12616a1e-8913-416d-ba28-34bc76c1718a',
                'direction': 'ingress',
                'remote_ip_prefix': null,
                'protocol': null,
                'ethertype': 'IPv4',
                'tenant_id': 'b484b27774144a8d8d1c2d49bf85370d',
                'port_range_max': null,
                'port_range_min': null,
                'id': 'c27b192d-3071-4e55-a5d5-ee0b78880e9e',
                'security_group_id': '12616a1e-8913-416d-ba28-34bc76c1718a'
              }
            ],
            'name': 'default'
          }
        ]
      }
    },
    getSecurityDetails: {
      path: '/api/v1/:projectId/security/:securityId',
      in: '',
      out: {
        'security_group': {
          'tenant_id': 'b484b27774144a8d8d1c2d49bf85370d',
          'description': 'Default security group',
          'id': '12616a1e-8913-416d-ba28-34bc76c1718a',
          'security_group_rules': [
            {
              'remote_group_id': null,
              'direction': 'egress',
              'remote_ip_prefix': null,
              'protocol': null,
              'ethertype': 'IPv6',
              'tenant_id': 'b484b27774144a8d8d1c2d49bf85370d',
              'port_range_max': null,
              'port_range_min': null,
              'id': '0ab81392-362b-4d4e-940f-c9f5a9da3a25',
              'security_group_id': '12616a1e-8913-416d-ba28-34bc76c1718a'
            },
            {
              'remote_group_id': '12616a1e-8913-416d-ba28-34bc76c1718a',
              'direction': 'ingress',
              'remote_ip_prefix': null,
              'protocol': null,
              'ethertype': 'IPv6',
              'tenant_id': 'b484b27774144a8d8d1c2d49bf85370d',
              'port_range_max': null,
              'port_range_min': null,
              'id': '12007527-97f1-4d96-a11a-b3b94206d686',
              'security_group_id': '12616a1e-8913-416d-ba28-34bc76c1718a'
            },
            {
              'remote_group_id': null,
              'direction': 'egress',
              'remote_ip_prefix': null,
              'protocol': null,
              'ethertype': 'IPv4',
              'tenant_id': 'b484b27774144a8d8d1c2d49bf85370d',
              'port_range_max': null,
              'port_range_min': null,
              'id': '2a3baa1e-2d44-4632-9a23-6b00921fdcf8',
              'security_group_id': '12616a1e-8913-416d-ba28-34bc76c1718a'
            },
            {
              'remote_group_id': '12616a1e-8913-416d-ba28-34bc76c1718a',
              'direction': 'ingress',
              'remote_ip_prefix': null,
              'protocol': null,
              'ethertype': 'IPv4',
              'tenant_id': 'b484b27774144a8d8d1c2d49bf85370d',
              'port_range_max': null,
              'port_range_min': null,
              'id': 'c27b192d-3071-4e55-a5d5-ee0b78880e9e',
              'security_group_id': '12616a1e-8913-416d-ba28-34bc76c1718a'
            }
          ],
          'name': 'default'
        }
      }
    }
  }
};
