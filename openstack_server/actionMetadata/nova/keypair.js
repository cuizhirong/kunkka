var novaRemote = require('config')('remote').nova;

var defaultMeta = {
  method      : 'post',
  remote      : novaRemote,
  type        : null,
  apiDir      : '/api/v1/:projectId/keypairs/action/',
  dir         : '/v2.1/{tenant_id}/os-keypairs/{keypair_name}',
  actionKey   : '',
  actionValue : {},
  required    : [],
  optional    : [],
  oneOf       : [],
  urlParam    : ['project_id']
};

var metadata = {
  'keypairCreate': {
    type      : 'create',
    actionKey : 'keypair',
    required  : ['name'],
    dir       : '/v2.1/{tenant_id}/os-keypairs',
    optional  : ['public_key']
  },
  'keypairDelete': {
    type     : 'delete',
    method   : 'delete',
    required : ['keypair_name']
  }
};

Object.defineProperty(metadata, 'default', {
  value        : defaultMeta,
  writable     : false,
  enumerable   : false,
  configurable : true
});

module.exports = metadata;
