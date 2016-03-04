var cinderRemote = require('config')('remote').cinder;

var defaultMeta = {
  method      : 'post',
  remote      : cinderRemote,
  type        : null,
  apiDir      : '/api/v1/:projectId/volumes/:volumeId/action/',
  dir         : '/v2/{tenant_id}/volumes/{volume_id}/action',
  actionKey   : 'volume',
  actionValue : {},
  required    : [],
  optional    : [],
  oneOf       : [],
  urlParam    : ['project_id', 'volume_id']
};

var metadata = {
  'create': {
    type     : 'create',
    apiDir   : '/api/v1/:projectId/volumes/action/',
    dir      : '/v2/{tenant_id}/volumes',
    required : ['size'],
    optional : ['availability_zone', 'source_volid', 'description', 'multiattach', 'snapshot_id', 'name', 'imageRef', 'volume_type', 'metadata', 'source_replica', 'consistencygroup_id', 'scheduler_hints'],
    urlParam : ['project_id']
  },
  'update': {
    type     : 'update',
    method   : 'put',
    dir      : '/v2/{tenant_id}/volumes/{volume_id}',
    optional : ['name', 'description', 'metadata']
  },
  'createSnapshot': {
    type      : 'createsnapshot',
    dir       : '/v2/{tenant_id}/snapshots',
    actionKey : 'snapshot',
    optional  : ['name', 'description', 'force'],
    urlParam  : ['project_id']
  },
  'attachInstance': {
    type      : 'attach',
    actionKey : 'os-attach',
    optional  : ['instance_uuid', 'host_name', 'mountpoint']
  },
  'detachInstance': {
    type      : 'detach',
    actionKey : 'os-force_detach',
    required  : ['attachment_id', 'connector']
  },
  'extendSize': {
    type      : 'resize',
    actionKey : 'os-extend',
    required  : ['new_size']
  },
  'readOnly': {
    type        : 'readonly',
    actionKey   : 'os-set_image_metadata',
    actionValue : {'metadata': {'readonly': true}}
  },
  'readWrite': {
    type        : 'rw',
    actionKey   : 'os-set_image_metadata',
    actionValue : {'metadata': {'readonly': false}}
  },
  'delete': {
    type      : 'delete',
    method    : 'delete',
    dir       : '/v2/{tenant_id}/volumes/{volume_id}',
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
