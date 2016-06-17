'use strict';

module.exports = {
  dependencies: {
    'mysql': '^2.10.2',
    'async': '^1.5.0'
  },
  config: {
    mysql: {
      host: '121.201.52.181',
      port: 3306,
      user: 'root',
      password: '1234',
      database: 'kunkka',
      table: 'tusk'
    },
    assets_dir: '/opt/assets'
  },
  setting: [
    {
      app: 'global',
      name: 'logo_url',
      value: '/static/assets/nav_logo.png',
      type: 'string'
    }, {
      app: 'global',
      name: 'favicon',
      value: '/static/assets/favicon.ico',
      type: 'string'
    }, {
      app: 'global',
      name: 'title',
      value: 'UnitedStack 有云',
      type: 'string'
    }, {
      app: 'global',
      name: 'default_image_url',
      value: '',
      type: 'string',
      description: '图片大小为40*40'
    }, {
      app: 'global',
      name: 'enable_charge',
      value: 'false',
      type: 'boolean'
    }
  ]
};
