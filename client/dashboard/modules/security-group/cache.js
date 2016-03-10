var request = require('client/dashboard/cores/request');

module.exports = {
  getSecuritygroupList: function() {
    return request.get({
      url: '/api/v1/' + HALO.user.projectId + '/security'
    }).then(function(data) {
      return data.security_groups;
    });
  }
};
