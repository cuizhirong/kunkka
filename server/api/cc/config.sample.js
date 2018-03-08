'use strict';

module.exports = {
  setting: [{
    app: 'global',
    name: 'enable_video',
    value: false,
    type: 'boolean',
    description: '开启视频服务'
  }, {
    app: 'video',
    name: 'secret_key',
    value: '',
    type: 'string',
    description: '登陆加密KEY'
  }, {
    app: 'video',
    name: 'url',
    value: '',
    type: 'string',
    description: '跳转接口URL'
  }]
};
