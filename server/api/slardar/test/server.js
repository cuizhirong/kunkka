module.exports = {
  // name: 'keypair',
  path: 'nova/server.js',
  test: {
    getInstanceList: {
      path: '/api/v1/:projectId/servers/detail',
      input: {},
      output: {
        'servers': [
          {
            'status': 'ACTIVE',
            'updated': '2016-04-18T03:58:39Z',
            'hostId': '88323f09ecac365445a9902739fd7758e600a3cd509cf6bb5226d0a2',
            'addresses': {
              'shared': [
                {
                  'OS-EXT-IPS-MAC:mac_addr': 'fa:16:3e:de:e4:b0',
                  'version': 4,
                  'addr': '192.168.0.61',
                  'OS-EXT-IPS:type': 'fixed',
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
                  ],
                  'port': {
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
                    'device_id': '2d99ece4-2064-4a41-bde0-3b047a0e3513'
                  },
                  'subnet': {
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
                }
              ],
              '龙鹏-public-network': [
                {
                  'OS-EXT-IPS-MAC:mac_addr': 'fa:16:3e:de:fa:d0',
                  'version': 4,
                  'addr': '10.0.0.5',
                  'OS-EXT-IPS:type': 'fixed',
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
                  ],
                  'port': {
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
                    'device_id': '2d99ece4-2064-4a41-bde0-3b047a0e3513'
                  },
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
                    'subnetpool_id': null
                  }
                },
                {
                  'OS-EXT-IPS-MAC:mac_addr': 'fa:16:3e:de:fa:d0',
                  'version': 4,
                  'addr': '240.1.100.199',
                  'OS-EXT-IPS:type': 'floating',
                  'security_groups': []
                }
              ]
            },
            'key_name': 'longpeng-keypair',
            'image': {
              'expected_size': '10',
              'image_build_version': '2016-03-28',
              'min_ram': 0,
              'updated_at': '2016-03-29T02:40:23Z',
              'file': '/v2/images/c3fbabf3-8a1f-4420-95df-64ca4877d260/file',
              'owner': '4a73eeb4cda14804a722bf254e900682',
              'id': 'c3fbabf3-8a1f-4420-95df-64ca4877d260',
              'size': 13287936,
              'image_version': '0.3.4-64bit',
              'image_type': 'distribution',
              'self': '/v2/images/c3fbabf3-8a1f-4420-95df-64ca4877d260',
              'disk_format': 'raw',
              'image_name_order': '210',
              'image_meta': '{\'os_username\':\'root\', \'os_password\':\'\'}',
              'container_format': 'bare',
              'direct_url': 'rbd://27d39faa-48ae-4356-a8e3-19d5b81e179e/openstack-00/c3fbabf3-8a1f-4420-95df-64ca4877d260/snap',
              'schema': '/v2/schemas/image',
              'status': 'active',
              'tags': [],
              'visibility': 'public',
              'min_disk': 0,
              'virtual_size': null,
              'name': 'Cirros 0.3.4 64bit',
              'checksum': null,
              'created_at': '2016-03-29T02:40:17Z',
              'protected': false,
              'image_label_order': '100',
              'image_label': 'Cirros'
            },
            'OS-EXT-STS:task_state': null,
            'OS-EXT-STS:vm_state': 'active',
            'OS-SRV-USG:launched_at': '2016-04-18T03:41:43.000000',
            'flavor': {
              'name': 'm1.tiny',
              'ram': 512,
              'OS-FLV-DISABLED:disabled': false,
              'vcpus': 1,
              'swap': '',
              'os-flavor-access:is_public': true,
              'rxtx_factor': 1,
              'OS-FLV-EXT-DATA:ephemeral': 0,
              'disk': 1,
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
            'metadata': {},
            'volume': [
              {
                'attachments': [
                  {
                    'server_id': '2d99ece4-2064-4a41-bde0-3b047a0e3513',
                    'attachment_id': '90fdc591-5fe8-4316-b24b-c3b84f338c98',
                    'host_name': null,
                    'volume_id': 'c6418aa4-7227-4c1a-9423-3bad2b7e55ba',
                    'device': '/dev/vdb',
                    'id': 'c6418aa4-7227-4c1a-9423-3bad2b7e55ba'
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
                'replication_status': 'disabled'
              }
            ],
            'instance_snapshot': [
              {
                'expected_size': '10',
                'image_state': 'available',
                'image_build_version': '2016-03-28',
                'min_ram': 0,
                'ramdisk_id': null,
                'updated_at': '2016-04-18T03:58:40Z',
                'file': '/v2/images/577e27c5-5585-4486-900d-d4256eda51c2/file',
                'owner': 'b484b27774144a8d8d1c2d49bf85370d',
                'base_image_ref': 'c3fbabf3-8a1f-4420-95df-64ca4877d260',
                'size': 1073741824,
                'meta_var': 'meta_val',
                'image_version': '0.3.4-64bit',
                'user_id': 'b8c58306461947d19b94ecb17e99e3f7',
                'image_type': 'snapshot',
                'self': '/v2/images/577e27c5-5585-4486-900d-d4256eda51c2',
                'disk_format': 'raw',
                'id': '577e27c5-5585-4486-900d-d4256eda51c2',
                'image_name_order': '210',
                'protected': false,
                'container_format': 'bare',
                'direct_url': 'rbd://27d39faa-48ae-4356-a8e3-19d5b81e179e/openstack-00/577e27c5-5585-4486-900d-d4256eda51c2/snap',
                'schema': '/v2/schemas/image',
                'status': 'active',
                'image_location': 'snapshot',
                'tags': [],
                'kernel_id': null,
                'visibility': 'private',
                'min_disk': 1,
                'virtual_size': null,
                'instance_uuid': '2d99ece4-2064-4a41-bde0-3b047a0e3513',
                'name': '龙鹏-server-image',
                'checksum': 'bf9d19d7a5ebe5fef94b3fbc6d32c4b6',
                'created_at': '2016-04-18T03:56:51Z',
                'image_meta': '{\'os_username\':\'root\', \'os_password\':\'\'}',
                'image_label_order': '100',
                'owner_id': 'b484b27774144a8d8d1c2d49bf85370d',
                'image_label': 'Cirros'
              }
            ],
            'keypair': {
              'public_key': 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDDzV3jCTJjI8wthLjLWLHH1Xo29WRTyWxGtqaqGTsMK5gPtRnTOZCNAYWbm4jgCh2GSTrZ3gm+czIsxGk6h2PfloghTYEcSdQbqI/nEcOE9kaXI7aNS0WBMpsyekk+M+vLTS91PTAcIFZU6A0LNebUCb3aq0Ry/qd0fMHs0NasLDig+YgpTIMgZ6LhtKSYQ4/RheBgL2am7Oznw+bY9xLUsAGoxMg9DC9FvE8mJMMASE6cpg5FTtQS36IA9FzgUs8AnjweVvFZ/TClhHw74C/KD2CKbgDe9TnOVlk4qIz4qifjtB2AeWz4RazKfmpXdXAqbjmWg/Amqq7jalF0lJg9 Generated-by-Nova',
              'name': 'longpeng-keypair',
              'fingerprint': '80:17:20:6b:fb:88:85:47:35:0d:ee:41:70:49:68:35'
            },
            'fixed_ips': [
              '192.168.0.61',
              '10.0.0.5'
            ],
            'floating_ip': {
              'floating_network_id': 'e6e3d527-301f-4596-ad4b-cc29d99ca567',
              'router_id': '9a635f3e-c721-4cce-86a1-8035bbda8541',
              'fixed_ip_address': '10.0.0.5',
              'floating_ip_address': '240.1.100.199',
              'tenant_id': 'b484b27774144a8d8d1c2d49bf85370d',
              'status': 'DOWN',
              'port_id': 'bd70cc6c-4858-473c-a568-2745dcb79d6d',
              'id': 'bdb79b21-8081-4b73-8fa2-4ec3f0bb1ecf'
            }
          }
        ]
      }
    },
    getInstanceDetails: {
      path: '/api/v1/:projectId/servers/:serverId',
      input: {},
      output: {
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
                'OS-EXT-IPS:type': 'fixed',
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
                ],
                'port': {
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
                  'device_id': '2d99ece4-2064-4a41-bde0-3b047a0e3513'
                },
                'subnet': {
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
              }
            ],
            '龙鹏-public-network': [
              {
                'OS-EXT-IPS-MAC:mac_addr': 'fa:16:3e:de:fa:d0',
                'version': 4,
                'addr': '10.0.0.5',
                'OS-EXT-IPS:type': 'fixed',
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
                ],
                'port': {
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
                  'device_id': '2d99ece4-2064-4a41-bde0-3b047a0e3513'
                },
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
                  'subnetpool_id': null
                }
              },
              {
                'OS-EXT-IPS-MAC:mac_addr': 'fa:16:3e:de:fa:d0',
                'version': 4,
                'addr': '240.1.100.199',
                'OS-EXT-IPS:type': 'floating',
                'security_groups': []
              }
            ]
          },
          'key_name': 'longpeng-keypair',
          'image': {
            'expected_size': '10',
            'image_build_version': '2016-03-28',
            'min_ram': 0,
            'updated_at': '2016-03-29T02:40:23Z',
            'file': '/v2/images/c3fbabf3-8a1f-4420-95df-64ca4877d260/file',
            'owner': '4a73eeb4cda14804a722bf254e900682',
            'id': 'c3fbabf3-8a1f-4420-95df-64ca4877d260',
            'size': 13287936,
            'image_version': '0.3.4-64bit',
            'image_type': 'distribution',
            'self': '/v2/images/c3fbabf3-8a1f-4420-95df-64ca4877d260',
            'disk_format': 'raw',
            'image_name_order': '210',
            'image_meta': '{\'os_username\':\'root\', \'os_password\':\'\'}',
            'container_format': 'bare',
            'direct_url': 'rbd://27d39faa-48ae-4356-a8e3-19d5b81e179e/openstack-00/c3fbabf3-8a1f-4420-95df-64ca4877d260/snap',
            'schema': '/v2/schemas/image',
            'status': 'active',
            'tags': [],
            'visibility': 'public',
            'min_disk': 0,
            'virtual_size': null,
            'name': 'Cirros 0.3.4 64bit',
            'checksum': null,
            'created_at': '2016-03-29T02:40:17Z',
            'protected': false,
            'image_label_order': '100',
            'image_label': 'Cirros'
          },
          'OS-EXT-STS:task_state': null,
          'OS-EXT-STS:vm_state': 'active',
          'OS-SRV-USG:launched_at': '2016-04-18T03:41:43.000000',
          'flavor': {
            'name': 'm1.tiny',
            'ram': 512,
            'OS-FLV-DISABLED:disabled': false,
            'vcpus': 1,
            'swap': '',
            'os-flavor-access:is_public': true,
            'rxtx_factor': 1,
            'OS-FLV-EXT-DATA:ephemeral': 0,
            'disk': 1,
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
          'metadata': {},
          'volume': [
            {
              'attachments': [
                {
                  'server_id': '2d99ece4-2064-4a41-bde0-3b047a0e3513',
                  'attachment_id': '90fdc591-5fe8-4316-b24b-c3b84f338c98',
                  'host_name': null,
                  'volume_id': 'c6418aa4-7227-4c1a-9423-3bad2b7e55ba',
                  'device': '/dev/vdb',
                  'id': 'c6418aa4-7227-4c1a-9423-3bad2b7e55ba'
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
              'replication_status': 'disabled'
            }
          ],
          'instance_snapshot': [
            {
              'expected_size': '10',
              'image_state': 'available',
              'image_build_version': '2016-03-28',
              'min_ram': 0,
              'ramdisk_id': null,
              'updated_at': '2016-04-18T03:58:40Z',
              'file': '/v2/images/577e27c5-5585-4486-900d-d4256eda51c2/file',
              'owner': 'b484b27774144a8d8d1c2d49bf85370d',
              'base_image_ref': 'c3fbabf3-8a1f-4420-95df-64ca4877d260',
              'size': 1073741824,
              'meta_var': 'meta_val',
              'image_version': '0.3.4-64bit',
              'user_id': 'b8c58306461947d19b94ecb17e99e3f7',
              'image_type': 'snapshot',
              'self': '/v2/images/577e27c5-5585-4486-900d-d4256eda51c2',
              'disk_format': 'raw',
              'id': '577e27c5-5585-4486-900d-d4256eda51c2',
              'image_name_order': '210',
              'protected': false,
              'container_format': 'bare',
              'direct_url': 'rbd://27d39faa-48ae-4356-a8e3-19d5b81e179e/openstack-00/577e27c5-5585-4486-900d-d4256eda51c2/snap',
              'schema': '/v2/schemas/image',
              'status': 'active',
              'image_location': 'snapshot',
              'tags': [],
              'kernel_id': null,
              'visibility': 'private',
              'min_disk': 1,
              'virtual_size': null,
              'instance_uuid': '2d99ece4-2064-4a41-bde0-3b047a0e3513',
              'name': '龙鹏-server-image',
              'checksum': 'bf9d19d7a5ebe5fef94b3fbc6d32c4b6',
              'created_at': '2016-04-18T03:56:51Z',
              'image_meta': '{\'os_username\':\'root\', \'os_password\':\'\'}',
              'image_label_order': '100',
              'owner_id': 'b484b27774144a8d8d1c2d49bf85370d',
              'image_label': 'Cirros'
            }
          ],
          'keypair': {
            'public_key': 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDDzV3jCTJjI8wthLjLWLHH1Xo29WRTyWxGtqaqGTsMK5gPtRnTOZCNAYWbm4jgCh2GSTrZ3gm+czIsxGk6h2PfloghTYEcSdQbqI/nEcOE9kaXI7aNS0WBMpsyekk+M+vLTS91PTAcIFZU6A0LNebUCb3aq0Ry/qd0fMHs0NasLDig+YgpTIMgZ6LhtKSYQ4/RheBgL2am7Oznw+bY9xLUsAGoxMg9DC9FvE8mJMMASE6cpg5FTtQS36IA9FzgUs8AnjweVvFZ/TClhHw74C/KD2CKbgDe9TnOVlk4qIz4qifjtB2AeWz4RazKfmpXdXAqbjmWg/Amqq7jalF0lJg9 Generated-by-Nova',
            'name': 'longpeng-keypair',
            'fingerprint': '80:17:20:6b:fb:88:85:47:35:0d:ee:41:70:49:68:35'
          },
          'fixed_ips': [
            '192.168.0.61',
            '10.0.0.5'
          ],
          'floating_ip': {
            'floating_network_id': 'e6e3d527-301f-4596-ad4b-cc29d99ca567',
            'router_id': '9a635f3e-c721-4cce-86a1-8035bbda8541',
            'fixed_ip_address': '10.0.0.5',
            'floating_ip_address': '240.1.100.199',
            'tenant_id': 'b484b27774144a8d8d1c2d49bf85370d',
            'status': 'DOWN',
            'port_id': 'bd70cc6c-4858-473c-a568-2745dcb79d6d',
            'id': 'bdb79b21-8081-4b73-8fa2-4ec3f0bb1ecf'
          }
        }
      }
    },
    getFlavorList: {
      path: '/api/v1/:projectId/flavors/detail',
      input: {},
      output: {
        'flavors': [
          {
            'name': 'm1.tiny',
            'links': [
              {
                'href': 'http://42.62.93.98:8774/v2.1/b484b27774144a8d8d1c2d49bf85370d/flavors/1',
                'rel': 'self'
              },
              {
                'href': 'http://42.62.93.98:8774/b484b27774144a8d8d1c2d49bf85370d/flavors/1',
                'rel': 'bookmark'
              }
            ],
            'ram': 512,
            'OS-FLV-DISABLED:disabled': false,
            'vcpus': 1,
            'swap': '',
            'os-flavor-access:is_public': true,
            'rxtx_factor': 1,
            'OS-FLV-EXT-DATA:ephemeral': 0,
            'disk': 1,
            'id': '1'
          },
          {
            'name': 'm1.small',
            'links': [
              {
                'href': 'http://42.62.93.98:8774/v2.1/b484b27774144a8d8d1c2d49bf85370d/flavors/2',
                'rel': 'self'
              },
              {
                'href': 'http://42.62.93.98:8774/b484b27774144a8d8d1c2d49bf85370d/flavors/2',
                'rel': 'bookmark'
              }
            ],
            'ram': 2048,
            'OS-FLV-DISABLED:disabled': false,
            'vcpus': 1,
            'swap': '',
            'os-flavor-access:is_public': true,
            'rxtx_factor': 1,
            'OS-FLV-EXT-DATA:ephemeral': 0,
            'disk': 20,
            'id': '2'
          },
          {
            'name': 'm1.medium',
            'links': [
              {
                'href': 'http://42.62.93.98:8774/v2.1/b484b27774144a8d8d1c2d49bf85370d/flavors/3',
                'rel': 'self'
              },
              {
                'href': 'http://42.62.93.98:8774/b484b27774144a8d8d1c2d49bf85370d/flavors/3',
                'rel': 'bookmark'
              }
            ],
            'ram': 4096,
            'OS-FLV-DISABLED:disabled': false,
            'vcpus': 2,
            'swap': '',
            'os-flavor-access:is_public': true,
            'rxtx_factor': 1,
            'OS-FLV-EXT-DATA:ephemeral': 0,
            'disk': 40,
            'id': '3'
          },
          {
            'name': 'sdfdf',
            'links': [
              {
                'href': 'http://42.62.93.98:8774/v2.1/b484b27774144a8d8d1c2d49bf85370d/flavors/31486214-a010-4259-8515-9ea127ef95cc',
                'rel': 'self'
              },
              {
                'href': 'http://42.62.93.98:8774/b484b27774144a8d8d1c2d49bf85370d/flavors/31486214-a010-4259-8515-9ea127ef95cc',
                'rel': 'bookmark'
              }
            ],
            'ram': 1,
            'OS-FLV-DISABLED:disabled': false,
            'vcpus': 1111,
            'swap': '',
            'os-flavor-access:is_public': true,
            'rxtx_factor': 1,
            'OS-FLV-EXT-DATA:ephemeral': 0,
            'disk': 1,
            'id': '31486214-a010-4259-8515-9ea127ef95cc'
          },
          {
            'name': 'm1.large',
            'links': [
              {
                'href': 'http://42.62.93.98:8774/v2.1/b484b27774144a8d8d1c2d49bf85370d/flavors/4',
                'rel': 'self'
              },
              {
                'href': 'http://42.62.93.98:8774/b484b27774144a8d8d1c2d49bf85370d/flavors/4',
                'rel': 'bookmark'
              }
            ],
            'ram': 8192,
            'OS-FLV-DISABLED:disabled': false,
            'vcpus': 4,
            'swap': '',
            'os-flavor-access:is_public': true,
            'rxtx_factor': 1,
            'OS-FLV-EXT-DATA:ephemeral': 0,
            'disk': 80,
            'id': '4'
          },
          {
            'name': 'm1.xlarge',
            'links': [
              {
                'href': 'http://42.62.93.98:8774/v2.1/b484b27774144a8d8d1c2d49bf85370d/flavors/5',
                'rel': 'self'
              },
              {
                'href': 'http://42.62.93.98:8774/b484b27774144a8d8d1c2d49bf85370d/flavors/5',
                'rel': 'bookmark'
              }
            ],
            'ram': 16384,
            'OS-FLV-DISABLED:disabled': false,
            'vcpus': 8,
            'swap': '',
            'os-flavor-access:is_public': true,
            'rxtx_factor': 1,
            'OS-FLV-EXT-DATA:ephemeral': 0,
            'disk': 160,
            'id': '5'
          },
          {
            'name': 'asdf',
            'links': [
              {
                'href': 'http://42.62.93.98:8774/v2.1/b484b27774144a8d8d1c2d49bf85370d/flavors/53c06d87-e895-4212-ab18-35d34c3e1f18',
                'rel': 'self'
              },
              {
                'href': 'http://42.62.93.98:8774/b484b27774144a8d8d1c2d49bf85370d/flavors/53c06d87-e895-4212-ab18-35d34c3e1f18',
                'rel': 'bookmark'
              }
            ],
            'ram': 1,
            'OS-FLV-DISABLED:disabled': false,
            'vcpus': 1111,
            'swap': '',
            'os-flavor-access:is_public': true,
            'rxtx_factor': 1,
            'OS-FLV-EXT-DATA:ephemeral': 0,
            'disk': 1,
            'id': '53c06d87-e895-4212-ab18-35d34c3e1f18'
          }
        ]
      }
    }
  }
};
