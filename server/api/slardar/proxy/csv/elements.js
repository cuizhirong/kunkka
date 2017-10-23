'use strict';

module.exports = [
  {
    pathRegExp: /\/cinder\/v2\/[a-z0-9]*\/snapshots\/detail/i,
    service: 'cinder',
    name: 'snapshots',
    tenantKey: 'os-extended-snapshot-attributes:project_id',
    fields: [
      {
        label: 'api.cinder.snapshot.name',
        value: 'name'
      }, {
        label: 'api.cinder.snapshot.size',
        value: 'size'
      }, {
        label: 'api.cinder.snapshot.project_id',
        value: 'os-extended-snapshot-attributes:project_id',
        extra: [{name: 'project', value: 'tenantName', label: 'api.nova.server.tenantName'}]
      }, {
        label: 'api.cinder.snapshot.volume_id',
        value: 'volume_id'
      }, {
        label: 'api.cinder.snapshot.status',
        value: 'status'
      }
    ]
  },
  {
    pathRegExp: /\/cinder\/v2\/[a-z0-9]*\/volumes\/detail/i,
    service: 'cinder',
    name: 'volumes',
    tenantKey: 'os-vol-tenant-attr:tenant_id',
    fields: [
      {
        label: 'api.cinder.volume.name',
        value: 'name'
      },
      {
        label: 'api.cinder.volume.size',
        value: 'size'
      },
      {
        label: 'api.cinder.volume.type',
        value: 'volume_type'
      },
      {
        label: 'api.cinder.volume.projectID',
        value: 'os-vol-tenant-attr:tenant_id',
        extra: [{name: 'project', value: 'tenantName', label: 'api.nova.server.tenantName'}]
      },
      {
        label: 'api.cinder.volume.userID',
        value: 'user_id',
        extra: [{name: 'user', value: 'userName', label: 'api.nova.server.userName'}]
      },
      {
        label: 'api.cinder.volume.shared',
        value: 'multiattach'
      },
      {
        label: 'api.cinder.volume.attribute',
        value: 'metadata.attached_mode'
      },
      {
        label: 'api.cinder.volume.status',
        value: 'status'
      }
    ]
  },
  {
    pathRegExp: /\/nova\/v2.1\/[a-z0-9]*\/servers\/detail/i,
    service: 'nova',
    name: 'servers',
    tenantKey: 'tenant_id',
    fields: [
      {
        label: 'api.nova.server.UUID',
        value: 'id'
      },
      {
        label: 'api.nova.server.name',
        value: 'name'
      },
      {
        label: 'AZ',
        value: 'OS-EXT-AZ:availability_zone'
      },
      {
        label: 'api.nova.server.host',
        value: 'OS-EXT-SRV-ATTR:host'
      },
      {
        label: 'api.nova.server.flavor',
        value: 'flavor.id',
        extra: [
          {name: 'flavor', value: 'flavorName', label: 'api.nova.server.flavorName'},
          {name: 'flavor', value: 'flavorRAM', label: 'api.nova.server.flavorRAM'},
          {name: 'flavor', value: 'flavorCPU', label: 'api.nova.server.flavorCPU'}
        ]
      },
      {
        label: 'api.nova.server.image',
        value: function (row) {
          if (row.image) {
            return row.image.id;
          } else if (row['os-extended-volumes:volumes_attached'].length) {
            return row['os-extended-volumes:volumes_attached'][0].id;
          } else {
            return '';
          }
        },
        name: 'image',
        extra: [
          {name: 'image', value: 'imageName', label: 'api.nova.server.imageName'}
        ]
      },
      {
        label: 'api.nova.server.volume',
        value: 'os-extended-volumes:volumes_attached-string',
        extra: [
          {name: 'volume', value: 'volumeSize', label: 'api.nova.server.volumeSize'},
          {name: 'volume', value: 'volumeCount', label: 'api.nova.server.volumeCount'}
        ]
      },
      {
        label: 'api.nova.server.floatingIp',
        value: function (row) {
          let ips = [];
          for (let key in row.addresses) {
            ips = ips.concat(row.addresses[key]);
          }
          let floatingIp;
          ips.some(ip => {
            return ip['OS-EXT-IPS:type'] === 'floating' && (floatingIp = ip.addr);
          });
          return floatingIp;
        },
        name: 'floating_ip'
      },
      {
        label: 'api.nova.server.fixedIp',
        value: function (row) {

          let ips = [];
          for (let key in row.addresses) {
            ips = ips.concat(row.addresses[key]);
          }
          let fixedIp = [];
          ips.forEach(ip => {
            if (ip['OS-EXT-IPS:type'] === 'fixed') {
              fixedIp.push(ip.addr);
            }
          });
          return fixedIp.join(';');
        },
        name: 'fixed_ip'
      },
      {
        label: 'api.nova.server.userID',
        value: 'user_id',
        extra: [{name: 'user', value: 'userName', label: 'api.nova.server.userName'}]
      },
      {
        label: 'api.nova.server.projectID',
        value: 'tenant_id',
        extra: [{name: 'project', value: 'tenantName', label: 'api.nova.server.tenantName'}]
      },
      {
        label: 'api.nova.server.status',
        value: 'status'
      },
      {
        label: 'api.nova.server.security_groups',
        value: 'security_groups'
      }
    ]
  },
  {
    pathRegExp: /\/glance\/v2\/images/i,
    service: 'glance',
    name: 'images',
    fields: [
      {
        label: 'api.glance.image.name',
        value: 'name'
      }, {
        label: 'api.glance.image.type',
        value: row => ((row.visibility === 'private') ? 'snapshot' : 'image'),
        name: 'image_type'
      }, {
        label: 'api.glance.image.size',
        value: row => (row.size / Math.pow(2, 30)).toFixed(2),
        name: 'size'
      }, {
        label: 'api.glance.image.status',
        value: 'status'
      }
    ]
  },
  {
    pathRegExp: /\/neutron\/v2.0\/floatingips/i,
    service: 'neutron',
    name: 'floatingips',
    tenantKey: 'tenant_id',
    fields: [
      {
        label: 'api.neutron.floatingip.floating_ip_address',
        value: 'floating_ip_address'
      },
      {
        label: 'api.neutron.floatingip.tenant_id',
        value: 'tenant_id',
        extra: [{name: 'project', value: 'tenantName', label: 'api.nova.server.tenantName'}]
      },
      {
        label: 'api.neutron.floatingip.fixed_ip_address',
        value: 'fixed_ip_address'
      },
      {
        label: 'api.neutron.floatingip.status',
        value: 'status'
      }
    ]
  },
  {
    pathRegExp: /\/nova\/v2.1\/[a-z0-9]*\/os-hypervisors\/detail/i,
    service: 'nova',
    name: 'os-hypervisors',
    dataName: 'hypervisors',
    fields: [{
      label: 'api.nova.server.name',
      value: 'hypervisor_hostname'
    }, {
      label: 'IP',
      value: 'host_ip'
    }, {
      label: 'vCPU',
      value: row => row.vcpus_used + '/' + row.vcpus,
      name: 'vcpus'
    }, {
      label: 'api.nova.memory',
      value: row => (row.memory_mb_used / 1024).toFixed(2) + '/' + (row.memory_mb / 1024).toFixed(2),
      name: 'memory'
    }, {
      label: 'api.nova.disk',
      value: row => row.local_gb_used + '/' + row.local_gb,
      name: 'disk'
    }, {
      label: 'api.nova.vms',
      value: 'running_vms'
    }, {
      label: 'api.nova.server.type',
      value: 'hypervisor_type'
    }, {
      label: 'api.nova.status',
      value: 'status'
    }, {
      label: 'State',
      value: 'state'
    }]
  }
];
