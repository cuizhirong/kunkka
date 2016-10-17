'use strict';

const csv = require('json2csv');

const objects = [
  {
    pathRegExp: /\/proxy\/csv\/cinder\/v2\/[a-z0-9]*\/snapshots\/detail/,
    service: 'cinder',
    name: 'snapshots',
    fields: [
      {
        label: 'api.cinder.snapshot.name',
        value: 'name'
      }, {
        label: 'api.cinder.size',
        value: 'size'
      }, {
        label: 'api.cinder.volume_id',
        value: 'volume_id'
      }, {
        label: 'api.cinder.status',
        value: 'status'
      }

    ]
  },
  {
    pathRegExp: /\/proxy\/csv\/cinder\/v2\/[a-z0-9]*\/volumes\/detail/,
    service: 'cinder',
    name: 'volumes',
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
        value: 'os-vol-tenant-attr:tenant_id'
      },
      {
        label: 'api.cinder.volume.userID',
        value: 'user_id'
      },
      {
        label: 'api.cinder.volume.shared',
        value: 'api.cinder.volume.multiattach'
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
    pathRegExp: /\/proxy\/csv\/nova\/v2.1\/[a-z0-9]*\/servers\/detail/,
    service: 'nova',
    name: 'servers',
    fields: [
      {
        label: 'api.nova.server.name',
        value: 'name'
      },
      {
        label: 'api.nova.server.host',
        value: 'OS-EXT-SRV-ATTR:host'
      },
      {
        label: 'api.nova.server.flavor',
        value: 'flavor.id'
      },
      {
        label: 'api.nova.server.image',
        value: 'image.id'
      },
      {
        label: 'api.nova.server.floatingIp',
        value: function (row) {
          let ips = [];
          for (let key in row.addresses) {
            ips = ips.concat(row.addresses[key]);
          }
          let floatingIp;
          ips.some(ip=> {
            return ip['OS-EXT-IPS:type'] === 'floating' && (floatingIp = ip.addr);
          });
          return floatingIp;
        }
      },
      {
        label: 'api.nova.server.fixedIp',
        value: function (row) {

          let ips = [];
          for (let key in row.addresses) {
            ips = ips.concat(row.addresses[key]);
          }
          let fixedIp = [];
          ips.forEach(ip=> {
            if (ip['OS-EXT-IPS:type'] === 'fixed') {
              fixedIp.push(ip.addr);
            }
          });
          return fixedIp.join(';');
        }
      },
      {
        label: 'api.nova.server.userID',
        value: 'user_id'
      },
      {
        label: 'api.nova.server.projectID',
        value: 'tenant_id'
      },
      {
        label: 'api.nova.server.status',
        value: 'status'
      }
    ]
  },
  {
    pathRegExp: /\/proxy\/csv\/glance\/v2\/images/,
    service: 'glance',
    name: 'images',
    fields: [
      {
        label: 'api.glance.image.name',
        value: 'name'
      }, {
        label: 'api.glance.image.type',
        value: 'image_type'
      }, {
        label: 'api.glance.image.size',
        value: row=> (row.size / Math.pow(2, 30)).toFixed(2)
      }, {
        label: 'api.glance.image.status',
        value: 'status'
      }
    ]
  },
  {
    pathRegExp: /\/proxy\/csv\/neutron\/v2.0\/floatingips/,
    service: 'neutron',
    name: 'floatingips',
    fields: [
      {
        label: 'api.neutron.floatingip.floating_ip_address',
        value: 'floating_ip_address'
      },
      {
        label: 'api.neutron.floatingip.tenant_id',
        value: 'tenant_id'
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
  }
];


module.exports = (req, res, next) => {

  let obj = {};
  let __ = req.i18n.__.bind(req.i18n);
  objects.some(o=> ((o.pathRegExp.test(req.path)) && (obj = o)));
  obj.fields.forEach(field=> {
    field.label = __(field.label);
  });

  res.setHeader('Content-Description', 'File Transfer');
  res.setHeader('Content-Type', 'application/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename=hosts.csv');
  res.setHeader('Expires', '0');
  res.setHeader('Cache-Control', 'must-revalidate');

  try {
    let output = csv({
      data: res.payload[obj.name],
      fields: obj.fields
    });
    res.send(output);
  } catch (e) {
    next(e);
  }
};
