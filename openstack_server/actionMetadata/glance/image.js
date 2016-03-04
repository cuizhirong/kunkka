var glanceRemote = require('config')('remote').glance;

var defaultMeta = {
  method      : 'post',
  remote      : glanceRemote,
  type        : null,
  apiDir      : '/api/v1/images/:imageId/action/',
  dir         : '/v2/images/{image_id}',
  actionKey   : 'image',
  actionValue : {},
  required    : [],
  optional    : [],
  oneOf       : [],
  urlParam    : ['image_id']
};

var metadata = {
  'create': {
    type     : 'create',
    apiDir   : '/api/v1/images/action/',
    dir      : '/v2/images',
    optional : ['name', 'id', 'visibility', 'tags', 'container_format', 'disk_format', 'min_disk', 'min_ram', 'protected', 'properties'],
    urlParam : []
  },
  'delete': {
    type      : 'delete',
    method    : 'delete',
    actionKey : ''
  }
};

Object.defineProperty(metadata, 'default', {
  value        : defaultMeta,
  writable     : false,
  enumerable   : false,
  configurable : true
});

module.exports = metadata;
