var novaRemote = require('config')('remote').nova;

var defaultMeta = {
  method      : 'post',
  remote      : novaRemote,
  type        : null,
  apiDir      : '/api/v1/:projectId/security/:securityId/action/',
  dir         : '/v2.1/{tenant_id}/os-security-groups/{security_group_id}',
  actionKey   : '',
  actionValue : {},
  required    : [],
  optional    : [],
  oneOf       : [],
  urlParam    : ['project_id', 'security_id']
};

var metadata = {
  'securityCreate': {
    type      : 'create',
    apiDir    : '/api/v1/:projectId/security/action/',
    dir       : '/v2.1/{tenant_id}/os-security-groups',
    actionKey : 'security_group',
    required  : ['name', 'description'],
    urlParam  : ['project_id']
  },
  'securityUpdate': {
    type      : 'update',
    method    : 'put',
    actionKey : 'security_group',
    required  : ['name', 'description']
  },
  'securityDelete': {
    type   : 'delete',
    method : 'delete'
  },
  'securityRuleCreate': {
    type      : 'createrule',
    apiDir    : '/api/v1/:projectId/security/action/',
    dir       : '/v2.1/{tenant_id}/os-security-group-rules',
    actionKey : 'security_group_rule',
    required  : ['parent_group_id', 'ip_protocol', 'from_port', 'to_port', 'cidr'],
    optional  : ['group_id'],
    urlParam  : ['project_id']
  },
  'securityRuleDelete': {
    type      : 'deleterule',
    method    : 'delete',
    apiDir    : '/api/v1/:projectId/security/action/',
    dir       : '/v2.1/{tenant_id}/os-security-group-rules/{security_group_rule_id}',
    actionKey : 'security_group_rule',
    required  : ['security_group_rule_id'],
    urlParam  : ['project_id', 'security_group_rule_id']
  },
  'securityDefaultRuleCreate': {
    type      : 'createruledefault',
    apiDir    : '/api/v1/:projectId/security/action/',
    dir       : '/v2.1/{tenant_id}/os-security-group-default-rules',
    actionKey : 'security_group_default_rule',
    required  : ['ip_protocol', 'from_port', 'to_port', 'cidr'],
    urlParam  : ['project_id']
  },
  'securityDefaultRuleDelete': {
    type      : 'deleteruledefault',
    method    : 'delete',
    apiDir    : '/api/v1/:projectId/security/action/',
    dir       : '/v2.1/{tenant_id}/os-security-group-default-rules/{security_group_default_rule_id}',
    actionKey : 'security_group_default_rule',
    required  : ['security_group_default_rule_id'],
    urlParam  : ['project_id', 'security_group_default_rule_id']
  }
};

Object.defineProperty(metadata, 'default', {
  value        : defaultMeta,
  writable     : false,
  enumerable   : false,
  configurable : true
});

module.exports = metadata;
