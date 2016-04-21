module.exports = {
  // name: 'quota',
  path: 'nova/quota.js',
  test: {
    getQuota: {
      path: '/api/v1/:projectId/quota/:targetId',
      input: {},
      output: {
        'quota': {
          'ram': {
            'total': 51200
          },
          'cores': {
            'total': 20
          },
          'instances': {
            'total': 10
          },
          'key_pairs': {
            'total': 100
          },
          'port': {
            'total': 50
          },
          'subnet': {
            'total': 200
          },
          'router': {
            'total': 10
          },
          'network': {
            'total': 100
          },
          'floatingip': {
            'total': 50
          },
          'security_group': {
            'total': 10
          },
          'volumes': {
            'total': 10
          },
          'gigabytes': {
            'total': 1000
          },
          'snapshots': {
            'total': 10
          }
        }
      }
    },
    getOverview: {
      path: '/api/v1/:projectId/overview',
      input: {},
      output: {
        'overview_usage': {
          'ram': {
            'total': 51200,
            'used': 512
          },
          'cores': {
            'total': 20,
            'used': 1
          },
          'instances': {
            'total': 10,
            'used': 1
          },
          'key_pairs': {
            'total': 100,
            'used': 1
          },
          'port': {
            'total': 50,
            'used': 6
          },
          'subnet': {
            'total': 200,
            'used': 2
          },
          'router': {
            'total': 10,
            'used': 1
          },
          'network': {
            'total': 100,
            'used': 3
          },
          'floatingip': {
            'total': 50,
            'used': 2
          },
          'security_group': {
            'total': 10,
            'used': 1
          },
          'volumes': {
            'total': 10,
            'used': 2
          },
          'gigabytes': {
            'total': 1000,
            'used': 2
          },
          'snapshots': {
            'total': 10,
            'used': 1
          },
          'volumes_sata': {
            'total': -1,
            'used': 1
          },
          'gigabytes_sata': {
            'total': -1,
            'used': 1
          },
          'snapshots_sata': {
            'total': -1,
            'used': 1
          },
          'volumes_ssd': {
            'total': -1,
            'used': 1
          },
          'gigabytes_ssd': {
            'total': -1,
            'used': 1
          },
          'snapshots_ssd': {
            'total': -1,
            'used': 0
          }
        },
        'volume_types': [
          'sata',
          'ssd'
        ]
      }
    },
    putQuota: {
      path: '/api/v1/:projectId/quota/:targetId',
      method: 'put',
      input: {
        body: {
          ram: 25600,
          port: 88,
          volumes: 8
        }
      },
      status: 204,
      output: {

      }
    }
  }
};
