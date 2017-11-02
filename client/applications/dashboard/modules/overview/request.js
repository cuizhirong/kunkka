const fetch = require('client/applications/dashboard/cores/fetch');

module.exports = {
  getOverview: function() {
    return fetch.get({
      url: '/api/v1/' + HALO.user.projectId + '/overview'
    });
  },
  applyQuotas: function(addedQuota, originalQuota, targetQuota) {
    const _targetQuota = {};

    for(let i in targetQuota) {
      _targetQuota[i] = targetQuota[i].total;
    }

    for(let i in addedQuota) {
      if(addedQuota[i] === undefined) {
        addedQuota[i] = 0;
      }
    }

    return fetch.post({
      url: '/api/approve-quota',
      data: {
        quota: _targetQuota,
        addedQuota: addedQuota,
        originQuota: originalQuota
      }
    });
  }
};
