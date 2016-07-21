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
    paypal: {
      //the app config from https://developer.paypal.com
      //login > dashboard > REST API apps > Create App.
      //sandbox:
      sandbox: {
        'mode': 'sandbox',
        'client_id': 'AYkST0fy3oDM9CsY8iH7ipT6Fz2VPD4HmAe0PP3Pe1_MUTCU6854lhtS8RURatyH8h5XvjIn9rWzf6LV',
        'client_secret': 'EAYHDRTdWE-hA0fXeySxpr2gQT-JDhKOIjFAH3vyMaB789uela-Q83mVkl2TdNHrgUng-OjL7yiDBwFW'
      },
      //live
      live: {
        'mode': 'live',
        'client_id': 'ATO3YYjH4to5a5dUExAX_wvmH4JZNy7mN5Bb6nlAit5cyWg8nAmDr6NbG0jVQMFf6XXTGXoynsfG6E7I',
        'client_secret': 'ECt-w5KlTuHYmNs7TWT_UqIDFhVtoHI-C74d5LgPE6Pv6adiwn85R8OlkrW-dvwWVqW5Eox__ylWkQWT'
      }
    },
    alipay: {
      //https://global.alipay.com
      common: {
        partner: '2088421404454660',
        _input_charset: 'utf-8',
        gateway: 'https://mapi.alipay.com/gateway.do?',
        partnerKey: '4xejv5jf62j0c1o85mbv5kz3cnlwlffo'
      },
      //create forex trade
      forex: {
        service: 'create_forex_trade',
        subject: 'recharge',
        body: 'recharge'
      },
      //single_trade_query
      //Query transaction results
      query: {
        service: 'single_trade_query'
      }
    }
  }
};
