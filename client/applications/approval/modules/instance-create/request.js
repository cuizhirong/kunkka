const storage = require('client/applications/approval/cores/storage');
const fetch = require('client/applications/approval/cores/fetch');
// let RSVP = require('rsvp');

module.exports = {
  getData: function() {
    return storage.getList(['flavor', 'image', 'securitygroup', 'network', 'keypair']).then(function(data) {
      return data;
    });
  },
  createApplication: function(data) {
    return fetch.post({
      url: '/api/apply',
      data: data
    });
  },
  getOverview: function() {
    return fetch.get({
      url: '/api/v1/' + HALO.user.projectId + '/overview'
    });
  }
};
