'use strict';

module.exports = {
  'dependencies': {
    'async': '^1.5.0',
    'json2csv': '^3.7.0',
    'lodash': '^4.17.0'
  },
  'config': {
    'region': [{
      'name': {
        'en': 'regionOne',
        'zh-CN': '一区'
      },
      'id': 'regionOne'
    }],
    'domain': 'Default',
    'cookie': {
      'maxAge': 1000 * 60 * 60 * 24 * 7
    },
    'admin_username': 'admin',
    'admin_password': 'JDHbTxDE8cbMMH8WQKt7TJvxQ',
    'admin_projectId': 'ff0d125cf38746b1b0a93149b8f6ed70',
    'neutron_network_vlanranges': ['datacentre:1:1000', 'datacentre2:1001:2000'],
    'endpoint_type': 'internal'
  },
  'setting': [
    {
      app: 'global',
      name: 'is_show_trash',
      value: 'false',
      type: 'boolean',
      description: '显示回收站'
    }, {
      app: 'global',
      name: 'enable_floatingip_bandwidth',
      value: 'false',
      type: 'boolean',
      description: '开启floatingip带宽'
    }, {
      app: 'global',
      name: 'enable_alarm',
      value: 'false',
      type: 'boolean',
      description: '监控报警开关'
    }, {
      app: 'global',
      name: 'enable_ldap',
      value: 'false',
      type: 'boolean',
      description: 'LDAP开关'
    }, {
      app: 'dashboard',
      name: 'enable_quick_deploy',
      value: 'false',
      type: 'boolean',
      description: 'dashboard页面-快速部署开关'
    }, {
      app: 'dashboard',
      name: 'total_gigabytes',
      value: 5000,
      type: 'number',
      description: 'dashboard页面-云硬盘最大总容量'
    }, {
      app: 'dashboard',
      name: 'max_single_gigabytes',
      value: 1000,
      type: 'number',
      description: 'dashboard页面-单个云硬盘最大容量'
    }, {
      app: 'dashboard',
      name: 'max_floatingip_bandwidth',
      value: 30,
      type: 'number',
      description: 'dashboard页面-最大 floatingip 带宽'
    }, {
      app: 'dashboard',
      name: 'listener_max_connection',
      value: 40000,
      type: 'number',
      description: 'dashboard页面-最大监听器数量'
    }, {
      app: 'dashboard',
      name: 'view.css',
      value: '',
      type: 'text',
      description: 'dashboard页面-定制样式'
    }, {
      app: 'dashboard',
      name: 'enable_ipsec',
      value: 'false',
      type: 'boolean',
      description: 'dashboard页面-开启 ipsec'
    }, {
      app: 'dashboard',
      name: 'enable_router_portforwarding',
      value: 'false',
      type: 'boolean',
      description: 'dashboard页面-路由端口转发开关'
    }, {
      app: 'dashboard',
      name: 'enable_orchestration',
      value: 'false',
      type: 'boolean',
      description: 'dashboard页面-显示编排'
    }, {
      app: 'admin',
      name: 'commercial_storage',
      value: 0,
      type: 'number',
      description: '管理页面-商业存储总容量'
    }, {
      app: 'admin',
      name: 'view.css',
      value: '',
      type: 'text',
      description: '管理页面-样式定制'
    }, {
      app: 'admin',
      name: 'is_show_vlan',
      value: 'true',
      type: 'boolean',
      description: '管理页面-显示 vlan'
    }, {
      app: 'admin',
      name: 'is_show_flat',
      value: 'true',
      type: 'boolean',
      description: '管理页面-显示 vlan'
    }, {
      app: 'bill',
      name: 'view.css',
      value: '',
      type: 'text',
      description: '计费页面-样式定制'
    }
  ]
};
