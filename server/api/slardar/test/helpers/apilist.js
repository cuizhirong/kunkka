'use strict';

const metaData = {
  catalog: [
    {
      'endpoints': [
        {
          'region_id': 'RegionOne',
          'url': 'http://23.253.248.171:9292',
          'region': 'RegionOne',
          'interface': 'admin',
          'id': 'b2605da9b25943beb49b2bd86aca2202'
        },
        {
          'region_id': 'RegionOne',
          'url': 'http://23.253.248.171:9292',
          'region': 'RegionOne',
          'interface': 'public',
          'id': 'c4d1184caf8c4351bff4bf502a09684e'
        },
        {
          'region_id': 'RegionOne',
          'url': 'http://23.253.248.171:9292',
          'region': 'RegionOne',
          'interface': 'internal',
          'id': 'cd73bda89e3948738c2721a8c3acac54'
        }
      ],
      'type': 'image',
      'id': '495df2483dc145dbb6b34bfbdd787aae',
      'name': 'glance'
    }
  ],
  'aUserInTest' : {
    pass: 'pass-123',
    userId: 'user-id-test-123',
    projects: [
      {
        name: 'project1',
        id: 'project-001'
      }, {
        name: 'project2',
        id: 'project-002'
      }
    ]
  }
};

const putList = {
};

putList.nova = {
  __novaQuotaUpdate: {
  }
};

putList.cinder = {
  __cinderQuotaUpdate: {
  }
};

putList.neutron = {
  __neutronQuotaUpdate: {
  }
};


const list = {};

/* keystone. */

list.__projects = {
  'projects': [
    {
      'is_domain': false,
      'description': '123',
      'links': {
        'self': 'http://lb.0.example242.ustack.in:5000/v3/projects/2205da28eb1e4e7aa4c1d20a0750c17c'
      },
      'enabled': true,
      'id': '2205da28eb1e4e7aa4c1d20a0750c17c',
      'parent_id': null,
      'domain_id': 'default',
      'name': 'cuizhirong'
    },
    {
      'is_domain': false,
      'description': '',
      'links': {
        'self': 'http://lb.0.example242.ustack.in:5000/v3/projects/2b8990b7c7ff470483e0569f4892862a'
      },
      'enabled': true,
      'id': '2b8990b7c7ff470483e0569f4892862a',
      'parent_id': null,
      'domain_id': 'default',
      'name': 'changyiqun'
    }
  ]
};

list.__users = {
  'users': [
    {
      'name': 'cinder',
      'links': {
        'self': 'http://lb.0.example242.ustack.in:5000/v3/users/02c6e11fc4a2457bbd1f026935f008be'
      },
      'domain_id': 'default',
      'enabled': true,
      'email': 'cinder@localhost',
      'id': '02c6e11fc4a2457bbd1f026935f008be'
    },
    {
      'name': 'nova',
      'links': {
        'self': 'http://lb.0.example242.ustack.in:5000/v3/users/11287d2b5b634d76b43c05744df81972'
      },
      'domain_id': 'default',
      'enabled': true,
      'email': 'nova@localhost',
      'id': '11287d2b5b634d76b43c05744df81972'
    },
    {
      'name': 'admin',
      'links': {
        'self': 'http://lb.0.example242.ustack.in:5000/v3/users/31aa9fca5b4f41409fdea43687d0f08b'
      },
      'domain_id': 'default',
      'enabled': true,
      'email': 'admin@unitedstack.com',
      'id': '31aa9fca5b4f41409fdea43687d0f08b'
    }
  ]
};


/* nova. */
list.__hosts = {
  'hypervisors': [
    {
      'status': 'enabled',
      'service': {
        'host': 'server-68',
        'disabled_reason': null,
        'id': 51
      },
      'vcpus_used': 0,
      'hypervisor_type': 'QEMU',
      'local_gb_used': 0,
      'vcpus': 4,
      'hypervisor_hostname': 'server-68.0.example242.ustack.in',
      'memory_mb_used': 512,
      'memory_mb': 7823,
      'current_workload': 0,
      'state': 'up',
      'host_ip': '10.242.0.68',
      'cpu_info': '{\'vendor\': \'Intel\', \'model\': \'IvyBridge\', \'arch\': \'x86_64\', \'features\': [\'pge\', \'avx\', \'clflush\', \'sep\', \'syscall\', \'tsc-deadline\', \'msr\', \'fsgsbase\', \'xsave\', \'erms\', \'cmov\', \'smep\', \'pcid\', \'pat\', \'lm\', \'tsc\', \'nx\', \'fxsr\', \'sse4.1\', \'pae\', \'sse4.2\', \'pclmuldq\', \'vme\', \'mmx\', \'osxsave\', \'cx8\', \'mce\', \'de\', \'rdtscp\', \'mca\', \'pse\', \'lahf_lm\', \'popcnt\', \'pdpe1gb\', \'apic\', \'sse\', \'f16c\', \'pni\', \'aes\', \'sse2\', \'ss\', \'hypervisor\', \'ssse3\', \'fpu\', \'cx16\', \'pse36\', \'mtrr\', \'rdrand\', \'x2apic\'], \'topology\': {\'cores\': 1, \'cells\': 1, \'threads\': 1, \'sockets\': 4}}',
      'running_vms': 0,
      'free_disk_gb': 272,
      'hypervisor_version': 1005003,
      'disk_available_least': 98,
      'local_gb': 272,
      'free_ram_mb': 7311,
      'id': 6
    },
    {
      'status': 'enabled',
      'service': {
        'host': 'server-69',
        'disabled_reason': null,
        'id': 45
      },
      'vcpus_used': 2,
      'hypervisor_type': 'QEMU',
      'local_gb_used': 21,
      'vcpus': 4,
      'hypervisor_hostname': 'server-69.0.example242.ustack.in',
      'memory_mb_used': 3072,
      'memory_mb': 7823,
      'current_workload': 0,
      'state': 'up',
      'host_ip': '10.242.0.69',
      'cpu_info': '{\'vendor\': \'Intel\', \'model\': \'IvyBridge\', \'arch\': \'x86_64\', \'features\': [\'pge\', \'avx\', \'clflush\', \'sep\', \'syscall\', \'tsc-deadline\', \'msr\', \'fsgsbase\', \'xsave\', \'erms\', \'cmov\', \'smep\', \'pcid\', \'pat\', \'lm\', \'tsc\', \'nx\', \'fxsr\', \'sse4.1\', \'pae\', \'sse4.2\', \'pclmuldq\', \'vme\', \'mmx\', \'osxsave\', \'cx8\', \'mce\', \'de\', \'rdtscp\', \'mca\', \'pse\', \'lahf_lm\', \'popcnt\', \'pdpe1gb\', \'apic\', \'sse\', \'f16c\', \'pni\', \'aes\', \'sse2\', \'ss\', \'hypervisor\', \'ssse3\', \'fpu\', \'cx16\', \'pse36\', \'mtrr\', \'rdrand\', \'x2apic\'], \'topology\': {\'cores\': 1, \'cells\': 1, \'threads\': 1, \'sockets\': 4}}',
      'running_vms': 2,
      'free_disk_gb': 251,
      'hypervisor_version': 1005003,
      'disk_available_least': 98,
      'local_gb': 272,
      'free_ram_mb': 4751,
      'id': 3
    }
  ]
};

list.__flavors = {
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
};

list.__flavorDetail = {
  'flavor': {
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
  }
};

list.__keypairs = {
  'keypairs': [
    {
      'keypair': {
        'public_key': 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDDzV3jCTJjI8wthLjLWLHH1Xo29WRTyWxGtqaqGTsMK5gPtRnTOZCNAYWbm4jgCh2GSTrZ3gm+czIsxGk6h2PfloghTYEcSdQbqI/nEcOE9kaXI7aNS0WBMpsyekk+M+vLTS91PTAcIFZU6A0LNebUCb3aq0Ry/qd0fMHs0NasLDig+YgpTIMgZ6LhtKSYQ4/RheBgL2am7Oznw+bY9xLUsAGoxMg9DC9FvE8mJMMASE6cpg5FTtQS36IA9FzgUs8AnjweVvFZ/TClhHw74C/KD2CKbgDe9TnOVlk4qIz4qifjtB2AeWz4RazKfmpXdXAqbjmWg/Amqq7jalF0lJg9 Generated-by-Nova',
        'name': 'longpeng-keypair',
        'fingerprint': '80:17:20:6b:fb:88:85:47:35:0d:ee:41:70:49:68:35'
      }
    }
  ]
};

list.__novaQuota = {
  'quota_set': {
    'injected_file_content_bytes': 10240,
    'metadata_items': 128,
    'server_group_members': 10,
    'server_groups': 10,
    'ram': 51200,
    'floating_ips': 10,
    'key_pairs': 100,
    'id': 'b484b27774144a8d8d1c2d49bf85370d',
    'instances': 10,
    'security_group_rules': 20,
    'injected_files': 5,
    'cores': 20,
    'fixed_ips': -1,
    'injected_file_path_bytes': 255,
    'security_groups': 10
  }
};

list.__servers = {
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
  ]
};

list.__serverDetail = {
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
};

/* cinder. */
list.__cinderQuota = {
  'quota_set': {
    'per_volume_gigabytes': -1,
    'volumes_sata': -1,
    'gigabytes': 1000,
    'backup_gigabytes': 1000,
    'volumes_ssd': -1,
    'snapshots': 10,
    'id': 'b484b27774144a8d8d1c2d49bf85370d',
    'snapshots_ssd': -1,
    'volumes': 10,
    'gigabytes_sata': -1,
    'backups': 10,
    'gigabytes_ssd': -1,
    'snapshots_sata': -1
  }
};

list.__snapshots = {
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
};

list.__snapshotDetail = {
  'snapshot': {
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
};

list.__volumes = {
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
      'links': [
        {
          'href': 'http://42.62.93.98:8776/v2/b484b27774144a8d8d1c2d49bf85370d/volumes/09aa716a-659c-4e99-8cfb-0d80ed724fa3',
          'rel': 'self'
        },
        {
          'href': 'http://42.62.93.98:8776/b484b27774144a8d8d1c2d49bf85370d/volumes/09aa716a-659c-4e99-8cfb-0d80ed724fa3',
          'rel': 'bookmark'
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
      'replication_status': 'disabled'
    },
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
      'links': [
        {
          'href': 'http://42.62.93.98:8776/v2/b484b27774144a8d8d1c2d49bf85370d/volumes/c6418aa4-7227-4c1a-9423-3bad2b7e55ba',
          'rel': 'self'
        },
        {
          'href': 'http://42.62.93.98:8776/b484b27774144a8d8d1c2d49bf85370d/volumes/c6418aa4-7227-4c1a-9423-3bad2b7e55ba',
          'rel': 'bookmark'
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
  ]
};

list.__volumeDetail = {
  'volume': {
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
    'links': [
      {
        'href': 'http://42.62.93.98:8776/v2/b484b27774144a8d8d1c2d49bf85370d/volumes/c6418aa4-7227-4c1a-9423-3bad2b7e55ba',
        'rel': 'self'
      },
      {
        'href': 'http://42.62.93.98:8776/b484b27774144a8d8d1c2d49bf85370d/volumes/c6418aa4-7227-4c1a-9423-3bad2b7e55ba',
        'rel': 'bookmark'
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
};

list.__volumeTypes = {
  'volume_types': [
    {
      'name': 'sata',
      'extra_specs': null,
      'os-volume-type-access:is_public': true,
      'is_public': true,
      'id': '36d8eb41-b425-46a5-a933-d06956f0f7eb',
      'description': null
    },
    {
      'name': 'ssd',
      'extra_specs': null,
      'os-volume-type-access:is_public': true,
      'is_public': true,
      'id': '379672da-d38f-4386-9e05-c77ebfb98698',
      'description': null
    }
  ]
};

/* glance. */
list.__images = {
  'images': [
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
    },
    {
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
    {
      'expected_size': '20',
      'image_build_version': '2014-10-09-b',
      'min_ram': 0,
      'updated_at': '2016-03-15T09:07:30Z',
      'file': '/v2/images/ee285be5-2b82-408d-bf3f-2bbc7c04788c/file',
      'owner': '4a73eeb4cda14804a722bf254e900682',
      'id': 'ee285be5-2b82-408d-bf3f-2bbc7c04788c',
      'size': 21474836480,
      'image_version': '13.1-64bit',
      'image_type': 'distribution',
      'self': '/v2/images/ee285be5-2b82-408d-bf3f-2bbc7c04788c',
      'disk_format': 'raw',
      'image_name_order': '100',
      'image_meta': '{\'os_username\':\'root\', \'os_password\':\'ELJq7WPUBTJLxVO\'}',
      'container_format': 'bare',
      'direct_url': 'rbd://27d39faa-48ae-4356-a8e3-19d5b81e179e/openstack-00/ee285be5-2b82-408d-bf3f-2bbc7c04788c/snap',
      'schema': '/v2/schemas/image',
      'status': 'active',
      'tags': [],
      'visibility': 'public',
      'min_disk': 0,
      'virtual_size': null,
      'name': 'OpenSUSE 13.1 64bit',
      'checksum': null,
      'created_at': '2016-03-15T09:01:54Z',
      'protected': false,
      'image_label_order': '250',
      'image_label': 'OpenSUSE'
    },
    {
      'expected_size': '20',
      'image_build_version': '2014-12-30-a',
      'min_ram': 0,
      'updated_at': '2016-03-15T08:31:14Z',
      'file': '/v2/images/d28d2a53-7c99-4c30-b07e-67b89c02c092/file',
      'owner': '4a73eeb4cda14804a722bf254e900682',
      'id': 'd28d2a53-7c99-4c30-b07e-67b89c02c092',
      'size': 21474836480,
      'image_version': '7.6-64bit',
      'image_type': 'distribution',
      'self': '/v2/images/d28d2a53-7c99-4c30-b07e-67b89c02c092',
      'disk_format': 'raw',
      'image_name_order': '200',
      'image_meta': '{\'os_username\':\'root\', \'os_password\':\'YIlrfdXL\'}',
      'container_format': 'bare',
      'direct_url': 'rbd://27d39faa-48ae-4356-a8e3-19d5b81e179e/openstack-00/d28d2a53-7c99-4c30-b07e-67b89c02c092/snap',
      'schema': '/v2/schemas/image',
      'status': 'active',
      'tags': [],
      'visibility': 'public',
      'min_disk': 0,
      'virtual_size': null,
      'name': 'Debian 7.6 64bit',
      'checksum': null,
      'created_at': '2016-03-15T08:28:10Z',
      'protected': false,
      'image_label_order': '150',
      'image_label': 'Debian'
    },
    {
      'expected_size': '20',
      'image_build_version': '2015-06-12-a',
      'min_ram': 0,
      'updated_at': '2016-03-15T07:44:17Z',
      'file': '/v2/images/bd5c3a06-4585-4c1f-9a2b-97d175cd456c/file',
      'owner': '4a73eeb4cda14804a722bf254e900682',
      'id': 'bd5c3a06-4585-4c1f-9a2b-97d175cd456c',
      'size': 21474836480,
      'image_version': '22-64bit',
      'image_type': 'distribution',
      'self': '/v2/images/bd5c3a06-4585-4c1f-9a2b-97d175cd456c',
      'disk_format': 'raw',
      'image_name_order': '400',
      'image_meta': '{\'os_username\':\'root\', \'os_password\':\'0Eknkr2b1X\'}',
      'container_format': 'bare',
      'direct_url': 'rbd://27d39faa-48ae-4356-a8e3-19d5b81e179e/openstack-00/bd5c3a06-4585-4c1f-9a2b-97d175cd456c/snap',
      'schema': '/v2/schemas/image',
      'status': 'active',
      'tags': [],
      'visibility': 'public',
      'min_disk': 0,
      'virtual_size': null,
      'name': 'Fedora 22 64bit',
      'checksum': null,
      'created_at': '2016-03-15T07:40:49Z',
      'protected': false,
      'image_label_order': '300',
      'image_label': 'Fedora'
    },
    {
      'expected_size': '20',
      'image_build_version': '2016-02-24-a',
      'min_ram': 0,
      'updated_at': '2016-03-15T07:13:12Z',
      'file': '/v2/images/897a57a3-36c2-4aac-ae76-ef18e9cc14bf/file',
      'owner': '4a73eeb4cda14804a722bf254e900682',
      'id': '897a57a3-36c2-4aac-ae76-ef18e9cc14bf',
      'size': 21474836480,
      'image_version': '5.11-64bit',
      'image_type': 'distribution',
      'self': '/v2/images/897a57a3-36c2-4aac-ae76-ef18e9cc14bf',
      'disk_format': 'raw',
      'image_name_order': '050',
      'image_meta': '{\'os_username\':\'root\', \'os_password\':\'DiuLfwOG\'}',
      'container_format': 'bare',
      'direct_url': 'rbd://27d39faa-48ae-4356-a8e3-19d5b81e179e/openstack-00/897a57a3-36c2-4aac-ae76-ef18e9cc14bf/snap',
      'schema': '/v2/schemas/image',
      'status': 'active',
      'tags': [],
      'visibility': 'public',
      'min_disk': 0,
      'virtual_size': null,
      'name': 'CentOS 5.11 64bit',
      'checksum': null,
      'created_at': '2016-03-15T07:04:34Z',
      'protected': false,
      'image_label_order': '100',
      'image_label': 'CentOS'
    },
    {
      'expected_size': '20',
      'image_build_version': '2016-02-23-a',
      'min_ram': 0,
      'updated_at': '2016-03-15T07:00:50Z',
      'file': '/v2/images/5446dd8e-b058-4503-a3a6-97e2a7c2ed66/file',
      'owner': '4a73eeb4cda14804a722bf254e900682',
      'id': '5446dd8e-b058-4503-a3a6-97e2a7c2ed66',
      'size': 21474836480,
      'image_version': '5.8-64bit',
      'image_type': 'distribution',
      'self': '/v2/images/5446dd8e-b058-4503-a3a6-97e2a7c2ed66',
      'disk_format': 'raw',
      'image_name_order': '020',
      'image_meta': '{\'os_username\':\'root\', \'os_password\':\'DiuLfwOG\'}',
      'container_format': 'bare',
      'direct_url': 'rbd://27d39faa-48ae-4356-a8e3-19d5b81e179e/openstack-00/5446dd8e-b058-4503-a3a6-97e2a7c2ed66/snap',
      'schema': '/v2/schemas/image',
      'status': 'active',
      'tags': [],
      'visibility': 'public',
      'min_disk': 0,
      'virtual_size': null,
      'name': 'CentOS 5.8 64bit',
      'checksum': null,
      'created_at': '2016-03-15T06:51:27Z',
      'protected': false,
      'image_label_order': '100',
      'image_label': 'CentOS'
    },
    {
      'expected_size': '6',
      'image_build_version': '2015-06-03-a',
      'min_ram': 0,
      'updated_at': '2016-03-15T06:51:15Z',
      'file': '/v2/images/37e20be3-7638-4c7e-97f3-d6da52ae1519/file',
      'owner': '4a73eeb4cda14804a722bf254e900682',
      'id': '37e20be3-7638-4c7e-97f3-d6da52ae1519',
      'size': 6442450944,
      'image_version': 'Fedora-Cloud-22-64bit',
      'image_type': 'distribution',
      'self': '/v2/images/37e20be3-7638-4c7e-97f3-d6da52ae1519',
      'disk_format': 'raw',
      'image_name_order': '100',
      'image_meta': '{\'os_username\':\'root\', \'os_password\':\'0Eknkr2b1X\'}',
      'container_format': 'bare',
      'direct_url': 'rbd://27d39faa-48ae-4356-a8e3-19d5b81e179e/openstack-00/37e20be3-7638-4c7e-97f3-d6da52ae1519/snap',
      'schema': '/v2/schemas/image',
      'status': 'active',
      'tags': [],
      'visibility': 'public',
      'min_disk': 0,
      'virtual_size': null,
      'name': 'Fedora Cloud Atomic 22 64bit',
      'checksum': null,
      'created_at': '2016-03-15T06:49:19Z',
      'protected': false,
      'image_label_order': '400',
      'image_label': 'Atomic'
    },
    {
      'expected_size': '20',
      'image_build_version': '2015-03-16-a',
      'min_ram': 0,
      'updated_at': '2016-03-15T06:38:40Z',
      'file': '/v2/images/3d1ce1fa-56c7-4365-b98a-b304a0c4bbd7/file',
      'owner': '4a73eeb4cda14804a722bf254e900682',
      'id': '3d1ce1fa-56c7-4365-b98a-b304a0c4bbd7',
      'size': 21474836480,
      'image_version': '2015.02-64bit',
      'image_type': 'distribution',
      'self': '/v2/images/3d1ce1fa-56c7-4365-b98a-b304a0c4bbd7',
      'disk_format': 'raw',
      'image_name_order': '300',
      'image_meta': '{\'os_username\':\'root\', \'os_password\':\'OyiDMqpDFSj\'}',
      'container_format': 'bare',
      'direct_url': 'rbd://27d39faa-48ae-4356-a8e3-19d5b81e179e/openstack-00/3d1ce1fa-56c7-4365-b98a-b304a0c4bbd7/snap',
      'schema': '/v2/schemas/image',
      'status': 'active',
      'tags': [],
      'visibility': 'public',
      'min_disk': 0,
      'virtual_size': null,
      'name': 'Arch Linux 2015.02 64bit',
      'checksum': null,
      'created_at': '2016-03-15T06:31:26Z',
      'protected': false,
      'image_label_order': '270',
      'image_label': 'Arch'
    },
    {
      'expected_size': '20',
      'image_build_version': '2016-03-03-a',
      'min_ram': 0,
      'updated_at': '2016-03-15T06:39:19Z',
      'file': '/v2/images/a6e979b8-c826-4943-8d20-1d13d55cf775/file',
      'owner': '4a73eeb4cda14804a722bf254e900682',
      'id': 'a6e979b8-c826-4943-8d20-1d13d55cf775',
      'size': 21474836480,
      'image_version': '14.04-64bit',
      'image_type': 'distribution',
      'self': '/v2/images/a6e979b8-c826-4943-8d20-1d13d55cf775',
      'disk_format': 'raw',
      'image_name_order': '200',
      'image_meta': '{\'os_username\':\'root\', \'os_password\':\'TbkZrCiSFd\'}',
      'container_format': 'bare',
      'direct_url': 'rbd://27d39faa-48ae-4356-a8e3-19d5b81e179e/openstack-00/a6e979b8-c826-4943-8d20-1d13d55cf775/snap',
      'schema': '/v2/schemas/image',
      'status': 'active',
      'tags': [],
      'visibility': 'public',
      'min_disk': 0,
      'virtual_size': null,
      'name': 'Ubuntu 14.04 64bit',
      'checksum': null,
      'created_at': '2016-03-15T06:13:48Z',
      'protected': false,
      'image_label_order': '200',
      'image_label': 'Ubuntu'
    },
    {
      'expected_size': '20',
      'image_build_version': '2015-04-21-a',
      'min_ram': 0,
      'updated_at': '2016-03-15T06:15:07Z',
      'file': '/v2/images/75f65172-c714-4687-9b30-016742627c50/file',
      'owner': '4a73eeb4cda14804a722bf254e900682',
      'id': '75f65172-c714-4687-9b30-016742627c50',
      'size': 21474836480,
      'image_version': '6.5-64bit',
      'image_type': 'distribution',
      'self': '/v2/images/75f65172-c714-4687-9b30-016742627c50',
      'disk_format': 'raw',
      'image_name_order': '100',
      'image_meta': '{\'os_username\':\'root\', \'os_password\':\'UdQGtYlhHj\'}',
      'container_format': 'bare',
      'direct_url': 'rbd://27d39faa-48ae-4356-a8e3-19d5b81e179e/openstack-00/75f65172-c714-4687-9b30-016742627c50/snap',
      'schema': '/v2/schemas/image',
      'status': 'active',
      'tags': [],
      'visibility': 'public',
      'min_disk': 0,
      'virtual_size': null,
      'name': 'CentOS 6.5 64bit',
      'checksum': 'fabb4f9449242c62cbbca0f98937aac4',
      'created_at': '2016-03-11T09:34:14Z',
      'protected': false,
      'image_label_order': '100',
      'image_label': 'CentOS'
    }
  ]
};

list.__imageDetail = {
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
};

/* neutron. */
list.__floatingips = {
  'floatingips': [
    {
      'floating_network_id': 'e6e3d527-301f-4596-ad4b-cc29d99ca567',
      'router_id': '9a635f3e-c721-4cce-86a1-8035bbda8541',
      'fixed_ip_address': '10.0.0.5',
      'floating_ip_address': '240.1.100.199',
      'tenant_id': 'b484b27774144a8d8d1c2d49bf85370d',
      'status': 'DOWN',
      'port_id': 'bd70cc6c-4858-473c-a568-2745dcb79d6d',
      'id': 'bdb79b21-8081-4b73-8fa2-4ec3f0bb1ecf'
    },
    {
      'floating_network_id': 'e6e3d527-301f-4596-ad4b-cc29d99ca567',
      'router_id': '9a635f3e-c721-4cce-86a1-8035bbda8541',
      'fixed_ip_address': '10.0.0.2',
      'floating_ip_address': '240.1.100.99',
      'tenant_id': 'b484b27774144a8d8d1c2d49bf85370d',
      'status': 'DOWN',
      'port_id': '22b2564c-8bd1-48d5-a060-36dcfed4f754',
      'id': 'bdb79b21-8081-4b73-8fa2-4ec3f0bb1ecf'
    }
  ]
};

list.__floatingipDetail = {
  'floatingip': {
    'floating_network_id': 'e6e3d527-301f-4596-ad4b-cc29d99ca567',
    'router_id': '9a635f3e-c721-4cce-86a1-8035bbda8541',
    'fixed_ip_address': '10.0.0.5',
    'floating_ip_address': '240.1.100.199',
    'tenant_id': 'b484b27774144a8d8d1c2d49bf85370d',
    'status': 'DOWN',
    'port_id': 'bd70cc6c-4858-473c-a568-2745dcb79d6d',
    'id': 'bdb79b21-8081-4b73-8fa2-4ec3f0bb1ecf'
  }
};

list.__networks = {
  'networks': [
    {
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
    {
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
};

list.__networkDetail = {
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
  }
};

list.__ports = {
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
      'device_id': '2d99ece4-2064-4a41-bde0-3b047a0e3513'
    }
  ]
};

list.__portDetail = {
  'port': {
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
    'device_owner': 'network:dhcp',
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
  }
};

list.__neutronQuota = {
  'quota': {
    'subnet': 200,
    'network': 100,
    'floatingip': 50,
    'subnetpool': -1,
    'security_group_rule': 100,
    'security_group': 10,
    'router': 10,
    'rbac_policy': 10,
    'port': 50
  }
};

list.__routers = {
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
      'id': '9a635f3e-c721-4cce-86a1-8035bbda8541'
    }
  ]
};

list.__routerDetail = {
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
};

list.__security_groups = {
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
};

list.__security_groupDetail = {
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
};

list.__subnets = {
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
      'subnetpool_id': null
    }
  ]
};

list.__subnetDetail = {
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
};

module.exports = {
  'metaData': metaData,
  'list': list,
  'putList': putList
};
