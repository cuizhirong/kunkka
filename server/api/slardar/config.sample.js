'use strict';

module.exports = {
  'dependencies': {
    'async': '^1.5.0'
  },
  'config': {
    'region': [{
      'name': {
        'en': 'RegionOne',
        'zh-CN': '一区'
      },
      'id': 'RegionOne'
    }],
    'domain': 'default',
    'cookie': {
      'maxAge': 1000 * 60 * 60 * 24 * 7
    },
    'port': 5678
  },
  'setting': [
    {
      app: 'login',
      name: 'logo_url',
      value: '/static/assets/logo@2x.png',
      type: 'string'
    }, {
      app: 'login',
      name: 'company',
      value: '©2016 UnitedStack Inc. All Rights Reserved. 京ICP备13015821号',
      type: 'string'
    }, {
      app: 'admin',
      name: 'is_show_trash',
      value: 'false',
      type: 'boolean'
    }, {
      app: 'dashboard',
      name: 'total_gigabytes',
      value: 5000,
      type: 'number'
    }, {
      app: 'dashboard',
      name: 'max_single_gigabytes',
      value: 1000,
      type: 'number'
    }, {
      app: 'dashboard',
      name: 'is_show_vlan',
      value: 'true',
      type: 'boolean'
    }, {
      app: 'dashboard',
      name: 'max_floatingip_bandwidth',
      value: 30,
      type: 'number'
    }
  ]
};
