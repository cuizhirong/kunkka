'use strict';

module.exports = {
  dependencies: {
    'ccap': '^0.6.10'
  },
  config: {
    reg_token_expire: 60 * 60 * 24,
    reg_sms_expire: 60 * 10,
    phone_area_code: '86'
  },
  'setting': [
    {
      app: 'auth',
      name: 'auth_logo_url',
      value: '/static/assets/login/logo@2x.png',
      type: 'string',
      description: '登录、注册界面 - logo 地址'
    }, {
      app: 'auth',
      name: 'single_logo_url',
      value: '/static/assets/nav_logo.png',
      type: 'string',
      description: '提示信息页面 - logo 地址'
    }, {
      app: 'auth',
      name: 'company',
      value: '©2016 UnitedStack Inc. All Rights Reserved. 京ICP备13015821号',
      type: 'string',
      description: '登录界面-公司 copyright'
    }, {
      app: 'auth',
      name: 'corporation_name',
      value: 'UnitedStack 有云',
      type: 'string',
      description: '登录界面-公司名称'
    }, {
      app: 'auth',
      name: 'enable_domain',
      value: 'false',
      type: 'boolean',
      description: '登录界面-支持多 domain 功能'
    }, {
      app: 'global',
      name: 'enable_register',
      value: 'false',
      type: 'boolean',
      description: '开启注册功能'
    }, {
      app: 'auth',
      name: 'eula_content',
      value: '',
      type: 'string',
      description: '注册页面-用户协议页面地址'
    }
  ]
};
