'use strict';

module.exports = {
  dependencies: {
    'multer': '^1.1.0',
    'node-uuid': '^1.4.7'
  },
  config: {
    invoker: {
      flow: [
        'admin', 'owner', 'member'
      ]
    },
    //attachment_path: '/opt/attachment/nfs',
    file_size_limit: 10 * 1024 * 1024
  },
  setting: [
    {
      app: 'global',
      name: 'enable_ticket',
      value: 'false',
      type: 'boolean'
    }
  ]
};
