const storage = require('client/applications/dashboard/cores/storage');
const fetch = require('client/applications/dashboard/cores/fetch');
const RSVP = require('rsvp');

module.exports = {
  getList: function(forced) {
    return storage.getList(['ikepolicy'], forced).then((res) => {
      return res.ikepolicy;
    });
  },
  deletePolicy: function(items) {
    let deferredList = [];
    items.forEach((item) => {
      deferredList.push(fetch.delete({
        url: '/proxy/neutron/v2.0/vpn/ikepolicies/' + item.id
      }));
    });
    return RSVP.all(deferredList);
  },
  createPolicy: function(data) {
    return fetch.post({
      url: '/proxy/neutron/v2.0/vpn/ikepolicies',
      data: data
    }).then(function(res) {
      return res;
    });
  }
};
