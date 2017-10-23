module.exports = {
  // name: 'volume',
  path: 'cinder/volume.js',
  test: {
    getVolumeList: {
      path: '/api/v1/:projectId/volumes/detail',
      input: {},
      output: {
        'volumes': [
          {
            'attachments': [
              {
                'server_id': '8d99ece4-2064-4a41-bde0-3b047a0e3513',
                'attachment_id': '80fdc591-5fe8-4316-b24b-c3b84f338c98',
                'host_name': null,
                'volume_id': '09aa716a-659c-4e99-8cfb-0d80ed724fa3',
                'device': '/dev/vdb',
                'id': '09aa716a-659c-4e99-8cfb-0d80ed724fa3'
              }
            ],
            'availability_zone': 'nova',
            'encrypted': false,
            'os-volume-replication:extended_status': null,
            'volume_type': 'ssd',
            'snapshot_id': null,
            'id': '09aa716a-659c-4e99-8cfb-0d80ed724fa3',
            'size': 1,
            'user_id': 'b8c58306461947d19b94ecb17e99e3f7',
            'os-vol-tenant-attr:tenant_id': 'b484b27774144a8d8d1c2d49bf85370d',
            'metadata': {},
            'status': 'available',
            'description': null,
            'multiattach': false,
            'source_volid': null,
            'consistencygroup_id': null,
            'name': '龙鹏-volume-2',
            'bootable': 'false',
            'created_at': '2016-04-18T08:22:22.000000',
            'os-volume-replication:driver_data': null,
            'replication_status': 'disabled',
            'snapshots': []
          },
          {
            'attachments': [
              {
                'server_id': '2d99ece4-2064-4a41-bde0-3b047a0e3513',
                'attachment_id': '90fdc591-5fe8-4316-b24b-c3b84f338c98',
                'host_name': null,
                'volume_id': 'c6418aa4-7227-4c1a-9423-3bad2b7e55ba',
                'device': '/dev/vdb',
                'id': 'c6418aa4-7227-4c1a-9423-3bad2b7e55ba',
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
                  'key_name': 'longpeng-keypair',
                  'image': {
                    'id': 'c3fbabf3-8a1f-4420-95df-64ca4877d260'
                  },
                  'OS-EXT-STS:task_state': null,
                  'OS-EXT-STS:vm_state': 'active',
                  'OS-SRV-USG:launched_at': '2016-04-18T03:41:43.000000',
                  'flavor': {
                    'id': '1'
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
            'availability_zone': 'nova',
            'encrypted': false,
            'os-volume-replication:extended_status': null,
            'volume_type': 'sata',
            'snapshot_id': null,
            'id': 'c6418aa4-7227-4c1a-9423-3bad2b7e55ba',
            'size': 1,
            'user_id': 'b8c58306461947d19b94ecb17e99e3f7',
            'os-vol-tenant-attr:tenant_id': 'b484b27774144a8d8d1c2d49bf85370d',
            'metadata': {
              'readonly': 'False',
              'attached_mode': 'rw'
            },
            'status': 'in-use',
            'description': null,
            'multiattach': false,
            'source_volid': null,
            'consistencygroup_id': null,
            'name': '龙鹏-volume',
            'bootable': 'false',
            'created_at': '2016-04-18T03:37:57.000000',
            'os-volume-replication:driver_data': null,
            'replication_status': 'disabled',
            'snapshots': [
              {
                'status': 'available',
                'metadata': {},
                'os-extended-snapshot-attributes:progress': '100%',
                'name': '龙鹏-volume-snapshot',
                'volume_id': 'c6418aa4-7227-4c1a-9423-3bad2b7e55ba',
                'os-extended-snapshot-attributes:project_id': 'b484b27774144a8d8d1c2d49bf85370d',
                'created_at': '2016-04-18T03:38:15.000000',
                'size': 1,
                'id': '48e8d90a-09c9-4f58-9c6f-11b0d60fe59b',
                'description': null
              }
            ]
          }
        ]
      }
    },
    getVolumeDetails: {
      path: '/api/v1/:projectId/volumes/:volumeId',
      input: {},
      output: {
        'volume': {
          'attachments': [
            {
              'server_id': '2d99ece4-2064-4a41-bde0-3b047a0e3513',
              'attachment_id': '90fdc591-5fe8-4316-b24b-c3b84f338c98',
              'host_name': null,
              'volume_id': 'c6418aa4-7227-4c1a-9423-3bad2b7e55ba',
              'device': '/dev/vdb',
              'id': 'c6418aa4-7227-4c1a-9423-3bad2b7e55ba',
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
                'key_name': 'longpeng-keypair',
                'image': {
                  'id': 'c3fbabf3-8a1f-4420-95df-64ca4877d260'
                },
                'OS-EXT-STS:task_state': null,
                'OS-EXT-STS:vm_state': 'active',
                'OS-SRV-USG:launched_at': '2016-04-18T03:41:43.000000',
                'flavor': {
                  'id': '1'
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
          'availability_zone': 'nova',
          'encrypted': false,
          'os-volume-replication:extended_status': null,
          'volume_type': 'sata',
          'snapshot_id': null,
          'id': 'c6418aa4-7227-4c1a-9423-3bad2b7e55ba',
          'size': 1,
          'user_id': 'b8c58306461947d19b94ecb17e99e3f7',
          'os-vol-tenant-attr:tenant_id': 'b484b27774144a8d8d1c2d49bf85370d',
          'metadata': {
            'readonly': 'False',
            'attached_mode': 'rw'
          },
          'status': 'in-use',
          'description': null,
          'multiattach': false,
          'source_volid': null,
          'consistencygroup_id': null,
          'name': '龙鹏-volume',
          'bootable': 'false',
          'created_at': '2016-04-18T03:37:57.000000',
          'os-volume-replication:driver_data': null,
          'replication_status': 'disabled',
          'snapshots': [
            {
              'status': 'available',
              'metadata': {},
              'os-extended-snapshot-attributes:progress': '100%',
              'name': '龙鹏-volume-snapshot',
              'volume_id': 'c6418aa4-7227-4c1a-9423-3bad2b7e55ba',
              'os-extended-snapshot-attributes:project_id': 'b484b27774144a8d8d1c2d49bf85370d',
              'created_at': '2016-04-18T03:38:15.000000',
              'size': 1,
              'id': '48e8d90a-09c9-4f58-9c6f-11b0d60fe59b',
              'description': null
            }
          ]
        }
      }
    }
  }
};
