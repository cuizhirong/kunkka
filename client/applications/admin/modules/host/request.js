var fetch = require('../../cores/fetch');
var RSVP = require('rsvp');

module.exports = {
  getListInitialize: function(pageLimit) {
    var req = [];
    req.push(this.getServiceList(pageLimit));
    req.push(this.getHypervisorList());

    return RSVP.all(req);
  },
  getHypervisorList: function() {
    var url = '/proxy/nova/v2.1/' + HALO.user.projectId + '/os-hypervisors';
    return fetch.get({
      url: url
    }).then((res) => {
      res._url = url;
      return res;
    });
  },
  getServiceList: function() {
    var url = '/proxy/nova/v2.1/' + HALO.user.projectId + '/os-services';
    return fetch.get({
      url: url
    }).then((res) => {
      res._url = url;
      return res;
    });
  }
};
