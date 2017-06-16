var storage = require('client/applications/dashboard/cores/storage');
var fetch = require('client/applications/dashboard/cores/fetch');

module.exports = {
  getList: function(forced) {
    return storage.getList(['heat'], forced).then(function(data) {
      return data.heat;
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
      url: '/proxy/swift/v1/AUTH_' + HALO.user.projectId + '/' + HALO.user.projectId
    });
  },
  getContainer: function() {
    return fetch.get({
      url: '/proxy/swift/v1/AUTH_' + HALO.user.projectId + '/' + HALO.user.projectId
    });
  },
  createContainer: function() {
    return fetch.put({
      url: '/proxy/swift/v1/AUTH_' + HALO.user.projectId + '/' + HALO.user.projectId
    });
  }
};
