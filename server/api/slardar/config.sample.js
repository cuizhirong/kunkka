'use strict';

module.exports = {
  'dependencies': {
    'async': '^1.5.0',
    'json2csv': '^3.7.0'
  },
  'config': {
    'region': [{
      'name': {
        'en': 'RegionOne',
        'zh-CN': '一区'
      },
      'id': 'RegionOne'
    }],
    'domain': 'Default',
    'cookie': {
      'maxAge': 1000 * 60 * 60 * 24 * 7
    },
    'port': 5678,
    'admin_username': 'admin',
    'admin_password': 'da2d728652d52ec8b09ca1be',
    'admin_projectId': '1f3a2befce114130a121632782adec42'
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
      name: 'is_show_vlan',
      value: 'true',
      type: 'boolean',
      description: 'dashboard页面-显示 vlan'
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
      app: 'bill',
      name: 'view.css',
      value: '',
      type: 'text',
      description: '计费页面-样式定制'
    }
  ]
};
