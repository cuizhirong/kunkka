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
    }, {
      'name': {
        'en': 'RegionTwo',
        'zh-CN': '二区'
      },
      'id': 'RegionOne'
    }],
    'domain': 'default',
    'cookie': {
      'maxAge': 1000 * 60 * 60 * 24 * 7
    },
    'port': 5678,
    'extension': {
      'type': ''
    }
  }
};
