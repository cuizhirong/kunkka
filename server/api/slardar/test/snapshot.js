module.exports = {
  // name: 'snapshot',
  path: 'cinder/snapshot.js',
  test: {
    getSnapshotList: {
      path: '/api/v1/:projectId/snapshots/detail',
      input: {},
      output: {
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
            'description': null,
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
          }
        ]
      }
    },
    getSnapshotDetails: {
      path: '/api/v1/:projectId/snapshots/:snapshotId',
      input: {},
      output: {
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
          'description': null,
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
        }
      }
    }
  }
};
