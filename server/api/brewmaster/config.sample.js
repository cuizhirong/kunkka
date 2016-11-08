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
      app: 'login',
      name: 'logo_url',
      value: '/static/assets/login/logo@2x.png',
      type: 'string'
    }, {
      app: 'login',
      name: 'company',
      value: '©2016 UnitedStack Inc. All Rights Reserved. 京ICP备13015821号',
      type: 'string'
    }, {
      app: 'login',
      name: 'corporation_name',
      value: 'UnitedStack 有云',
      type: 'string'
    }, {
      app: 'login',
      name: 'enable_domain',
      value: 'false',
      type: 'boolean'
    }, {
      app: 'global',
      name: 'enable_register',
      value: 'false',
      type: 'boolean'
    },
    {
      app: 'register',
      name: 'logo_url',
      value: '/static/assets/register/logo@2x.png',
      type: 'string'
    }, {
      app: 'register',
      name: 'company',
      value: '©2016 UnitedStack Inc. All Rights Reserved. 京ICP备13015821号',
      type: 'string'
    }, {
      app: 'register',
      name: 'corporation_name',
      value: 'UnitedStack 有云',
      type: 'string'
    },
    {
      app: 'register',
      name: 'eula_content',
      value: '',
      type: 'string'
    }, {
      app: 'register',
      name: 'enable_domain',
      value: 'false',
      type: 'boolean'
    }
  ]
};
