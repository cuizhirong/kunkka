var cinderRemote = require('config')('remote').cinder;
var Base = require('../../base');

var dicMeta = {
  'default': {
    method      : 'post',
    remote      : cinderRemote,
    dir         : '/v2/{tenant_id}/volumes/{volume_id}/action',
    actionKey   : '',
    actionValue : {},
    required    : [],
    optional    : [],
    oneOf       : [],
    urlParam    : ['project_id', 'volume_id']
  },
  'create': {
    dir       : '/v2/{tenant_id}/volumes',
    actionKey : 'volume',
    required  : ['size'],
    optional  : ['availability_zone', 'source_volid', 'description', 'multiattach', 'snapshot_id', 'name', 'imageRef', 'volume_type', 'metadata', 'source_replica', 'consistencygroup_id', 'scheduler_hints'],
    urlParam  : ['project_id']
  },
  'createSnapshot': {
    dir       : '/v2/{tenant_id}/snapshots',
    actionKey : 'snapshot',
    optional  : ['name', 'description', 'force'],
    urlParam  : ['project_id']
  },
  'attachInstance': {
    actionKey : 'os-attach',
    optional  : ['instance_uuid', 'host_name', 'mountpoint']
  },
  'detachInstance': {
    actionKey : 'os-force_detach',
    required  : ['attachment_id', 'connector']
  },
  'extendSize': {
    actionKey : 'os-extend',
    required  : ['new_size']
  },
  'readOnly': {
    actionKey   : 'os-set_image_metadata',
    actionValue : {'metadata': {'readonly': true}}
  },
  'readWrite': {
    actionKey   : 'os-set_image_metadata',
    actionValue : {'metadata': {'readonly': false}}
  },
  'delete': {
    method : 'delete',
    dir    : '/v2/{tenant_id}/volumes/{volume_id}'
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
