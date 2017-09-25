const storage = require('client/applications/dashboard/cores/storage');
const fetch = require('client/applications/dashboard/cores/fetch');
const RSVP = require('rsvp');
module.exports = {
  getList: function(forced) {
    return storage.getList(['orchestration'], forced).then(function(data) {
      return data.orchestration;
    });
  },
  getSingle: function(item) {
    return fetch.get({
      url: '/proxy/heat/v1/' + HALO.user.projectId + '/stacks/' + item.stack_name + '/' + item.id
    });
  },
  getResource: function(item) {
    return fetch.get({
      url: '/proxy/heat/v1/' + HALO.user.projectId + '/stacks/' + item.stack_name + '/' + item.id + '/resources'
    });
  },
  getEvents: function(item) {
    return fetch.get({
      url: '/proxy/heat/v1/' + HALO.user.projectId + '/stacks/' + item.stack_name + '/' + item.id + '/events'
    });
  },
  getTemplate: function(item) {
    return fetch.get({
      url: '/proxy/heat/v1/' + HALO.user.projectId + '/stacks/' + item.stack_name + '/' + item.id + '/template'
    });
  },
  validate: function(data) {
    return fetch.post({
      url: '/proxy/heat/v1/' + HALO.user.projectId + '/validate',
      data: data
    });
  },
  getTemplates: function() {
    return fetch.get({
      url: HALO.configs.swift_url + '/' + HALO.user.projectId + '_template'
    });
  },
  getContainer: function() {
    return fetch.get({
      url: HALO.configs.swift_url + '/' + HALO.user.projectId + '_template'
    });
  },
  checkStack: function(item, data) {
    return fetch.post({
      url: '/proxy/heat/v1/' + HALO.user.projectId + '/stacks/' + item.stack_name + '/' + item.id + '/actions',
      data: data
    });
  },
  deleteStack: function(items) {
    let deferredList = [];
    deferredList = items.map(item => fetch.delete({
      url: '/proxy/heat/v1/' + HALO.user.projectId + '/stacks/' + item.stack_name + '/' + item.id
    }));
    return RSVP.all(deferredList);
  },
  getResourceData: function(key) {
    return storage.getList(key, true).then(function(data) {
      return data;
    });
  },
  previewStack: function(data) {
    return fetch.post({
      url: '/proxy/heat/v1/' + HALO.user.projectId + '/stacks/preview',
      data: data
    });
  },
  createStack: function(data) {
    return fetch.post({
      url: '/proxy/heat/v1/' + HALO.user.projectId + '/stacks',
      data: data
    });
  },
  initContainer: function() {
    return fetch.put({
      url: '/proxy-swift/init-container'
    });
  }
};
