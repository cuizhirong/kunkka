'use strict';

module.exports = {
  'dependencies': {
    'async': '^1.5.0'
  },
  'config': {
    'domain': 'default',
    'cookie': {
      'maxAge': 1000 * 60 * 60 * 24 * 7
    },
    'extension': {
      'type': 'example_qiniu'
    }
  }
};
