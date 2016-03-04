var fs = require('fs');
var path = require('path');
var config = require('config');
var metadataExtension = require('extensions/' + config('extension').type + '/server/metadata');

var slugs = {
  'project_id'                     : 'tenant_id',
  'server_id'                      : 'server_id',
  'volume_id'                      : 'volume_id',
  'snapshot_id'                    : 'snapshot_id',
  'network_id'                     : 'network_id',
  'subnet_id'                      : 'subnet_id',
  'port_id'                        : 'port_id',
  'router_id'                      : 'router_id',
  'floatingip_id'                  : 'floatingip_id',
  'image_id'                       : 'image_id',
  'security_id'                    : 'security_group_id',
  'security_group_rule_id'         : 'security_group_rule_id',
  'security_group_default_rule_id' : 'security_group_default_rule_id',
  'keypair_name'                   : 'keypair_name'
};

var metadata = {
  slugs      : slugs
};

// original metadata.
fs.readdirSync(__dirname).forEach(function (f) {
  if ( fs.statSync(__dirname + '/' + f).isDirectory() ) {
    fs.readdirSync(__dirname + '/' + f).forEach(function (file) {
      metadata[path.basename(file, '.js')] = require('./' + f + '/' + file);
    });
  }
});

Object.keys(metadataExtension).forEach(function(s) {
  if (metadata[s]) {
    Object.assign(metadata[s], metadataExtension[s]);
  } else {
    metadata[s] = metadataExtension[s];
  }
});

module.exports = metadata;
