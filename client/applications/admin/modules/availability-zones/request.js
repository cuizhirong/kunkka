const fetch = require('../../cores/fetch');

module.exports = {
  getAvailabilityZone: function() {
    let url = '/proxy/nova/v2.1/os-availability-zone/detail';
    return fetch.get({
      url: url
    }).then((res) => {
      return this.getHostsList().then((_res) => {
        res.availabilityZoneInfo.forEach((ra) => {
          ra.host_list = _res.hypervisors;
        });
        return res;
      });
    });
  },
  getHostsList: function() {
    return fetch.get({
      url: '/api/v1/' + HALO.user.projectId + '/os-hypervisors/detail'
    });
  }
};
