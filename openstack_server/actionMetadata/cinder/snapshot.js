var cinderRemote = require('config')('remote').cinder;

var defaultMeta = {
  method      : 'post',
  remote      : cinderRemote,
  type        : null,
  apiDir      : '/api/v1/:projectId/snapshots/:snapshotId/action/',
  dir         : '/v2/{tenant_id}/snapshots/{snapshot_id}',
  actionKey   : 'snapshot',
  actionValue : {},
  required    : [],
  optional    : [],
  oneOf       : [],
  urlParam    : ['project_id', 'snapshot_id']
};

var metadata = {
  'snapshotCreateVolume': {
    type      : 'createvolume',
    dir       : '/v2/{tenant_id}/volumes',
    actionKey : 'volume',
    optional  : ['source_volid', 'description', 'multiattach', 'name', 'imageRef', 'volume_type', 'metadata', 'source_replica', 'consistencygroup_id', 'scheduler_hints'],
    urlParam  : ['project_id']
  },
  'snapshotDelete': {
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
