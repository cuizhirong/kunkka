'use strict';

module.exports = {
  dependencies: {
    'nodemailer': '^4.1.3',
    'urlencode': '^1.1.0'
  },
  config: {
    hl95: {
      host: 'http://q.hl95.com:8061/',
      username: '',
      password: '',
      epid: 0
    },
    smtp: {
      host: '',
      port: 465,
      secure: true,
      auth: {
        user: '',
        pass: ''
      }
    },
    admin_email: ''
  }
};
