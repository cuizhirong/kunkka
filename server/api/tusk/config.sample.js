'use strict';

module.exports = {
  dependencies: {
    'mysql': '^2.10.2',
    'async': '^1.5.0'
  },
  config: {
    assets_dir: '/opt/assets'
  },
  setting: [
    {
      app: 'global',
      name: 'logo_url',
      value: '/static/assets/nav_logo.png',
      type: 'string',
      description: 'logo 图片地址'
    }, {
      app: 'global',
      name: 'favicon',
      value: '/static/assets/favicon.ico',
      type: 'string',
      description: '浏览器 tab 小图标'
    }, {
      app: 'global',
      name: 'title',
      value: 'UnitedStack 有云',
      type: 'string',
      description: '浏览器 tab 标题'
    }, {
      app: 'global',
      name: 'default_image_url',
      value: '',
      type: 'string',
      description: '默认 image 图片， 图片大小为40*40'
    }, {
      app: 'global',
      name: 'enable_charge',
      value: 'false',
      type: 'boolean',
      description: '开启计费功能'
    }
  ]
};
