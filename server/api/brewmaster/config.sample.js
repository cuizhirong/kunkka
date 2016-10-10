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
      name: 'logo_url',
      value: '/static/assets/auth/logo@2x.png',
      type: 'string'
    }, {
      app: 'auth',
      name: 'company',
      value: '©2016 UnitedStack Inc. All Rights Reserved. 京ICP备13015821号',
      type: 'string'
    }, {
      app: 'auth',
      name: 'corporation_name',
      value: 'UnitedStack 有云',
      type: 'string'
    }
  ]
};
