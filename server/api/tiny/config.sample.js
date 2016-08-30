'use strict';

module.exports = {
  dependencies: {
    'multer': '^1.1.0',
    'node-uuid': '^1.4.7',
    'paypal-rest-sdk': '1.6.9',
    'xml2json': '^0.9.1',
    'md5': '^2.1.0'
  },
  config: {
    currency: {ISO4217: 'CNY', name: '人民币', unit: '元'},
    paypal: {
      //the app config from https://developer.paypal.com
      //login > dashboard > REST API apps > Create App.
      'mode': 'live',
      'client_id': 'ATO3YYjH4to5a5dUExAX_wvmH4JZNy7mN5Bb6nlAit5cyWg8nAmDr6NbG0jVQMFf6XXTGXoynsfG6E7I',
      'client_secret': 'ECt-w5KlTuHYmNs7TWT_UqIDFhVtoHI-C74d5LgPE6Pv6adiwn85R8OlkrW-dvwWVqW5Eox__ylWkQWT'
    },
    alipay: {
      /**
       * service
       * 国内账户:create_direct_pay_by_user
       * 国外账户:create_forex_trade
       */
      service: 'create_direct_pay_by_user',

      partner: '2088901240536772', //合作身份者id，以2088开头的16位纯数字
      partnerKey: '8yhb20fij34mb1gdsrgfb9x54su66w10', //安全检验码，以数字和字母组成的32位字符

      /**
       * seller_id,seller_email,seller_account_name三个参数至少必须传递一个(国内账户,国外无要求)。
       * 当签约账号就是收款账号时，请务必使用参数seller_id，即seller_id的值与partner的值相同。
       * 三个参数的优先级别是：seller_id>seller_account_name>seller_email
       */
      seller_id: '',
      seller_account_name: '',
      seller_email: 'usdzfb@163.com',


      /*** 一般无需配置 start ***/
      subject: '账户充值/Recharge:',
      body: '金额/Amount:',
      _input_charset: 'utf-8',
      payment_type: '1',
      gateway: 'https://mapi.alipay.com/gateway.do?'
      /*** 一般无需配置 end ***/
    }
  }
};
