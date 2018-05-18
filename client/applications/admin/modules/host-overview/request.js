const fetch = require('../../cores/fetch');

module.exports = {
  getOverview: function() {
    let url = '/proxy/nova/v2.1/' + HALO.user.projectId + '/os-hypervisors/statistics';
    return fetch.get({
      url: url
    }).then((res) => {
      res._url = url;
      return res;
    });
  },
  getDiskUsage: function() {
    let url = '/api/admin/host/overview/osd-stats';
    return fetch.get({
      url: url
    }).then(res => {
      res._url = url;
      return res;
    });
  }
};
