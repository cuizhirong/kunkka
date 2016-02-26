var glanceRemote = require('config')('remote').glance;
var Base = require('../../base');

var dicMeta = {
  'default': {
    method      : 'post',
    remote      : glanceRemote,
    dir         : '/v2/images',
    actionKey   : '',
    actionValue : {},
    required    : [],
    optional    : [],
    oneOf       : [],
    urlParam    : []
  },
  'create': {
    optional  : ['name', 'id', 'visibility', 'tags', 'container_format', 'disk_format', 'min_disk', 'min_ram', 'protected', 'properties']
  },
  'delete': {
    method   : 'delete',
    dir      : '/v2/images/{image_id}',
    urlParam : ['image_id']
  }
};
Base.generateDicMeta(dicMeta);

module.exports = {
  meta: dicMeta,
  action: function(token, region, callback, action, objSend) {
    var meta = dicMeta[action];
    return Base.operation.apply(this, [meta.remote[region], meta, token, region, callback, action, objSend]);
  }
};
