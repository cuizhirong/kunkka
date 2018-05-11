const fetch = require('../../cores/fetch');
const RSVP = require('rsvp');

module.exports = {
  getCurrentQuotaSetting: function() {
    const reqs = {
      compute: this.getComputeQuotaSetting(),
      network: this.getNetworkQuotaSetting(),
      storage: this.getStorageQuotaSetting()
    };

    return RSVP.hash(reqs);
  },
  getComputeQuotaSetting: function() {
    return fetch.get({
      url: '/proxy/nova/v2.1/os-quota-class-sets/default'
    }).then(res => {
      return res.quota_class_set;
    });
  },
  getStorageQuotaSetting: function() {
    const adminProjectId = HALO.user.projectId;
    return fetch.get({
      url: '/proxy/cinder/v3/' + adminProjectId +
        '/os-quota-class-sets/default'
    }).then(res => {
      return res.quota_class_set;
    });
  },
  getNetworkQuotaSetting: function() {
    const adminProjectId = HALO.user.projectId;
    return fetch.get({
      url: '/proxy/neutron/v2.0/quotas/' + adminProjectId +
        '/default'
    }).then(res => {
      return res.quota;
    });
  },
  updateQuotaSetting: function(quota) {
    const reqs = {};

    if(Object.keys(quota.compute).length !== 0) {
      reqs.compute = this.updateComputeQuotaSetting(quota.compute);
    }

    if(Object.keys(quota.storage).length !== 0) {
      reqs.storage = this.updateStorageQuotaSetting(quota.storage);
    }

    return RSVP.hash(reqs);
  },
  updateComputeQuotaSetting: function(computeQuota) {
    return fetch.put({
      url: '/proxy/nova/v2.1/os-quota-class-sets/default',
      data: {
        quota_class_set: computeQuota
      }
    });
  },
  updateStorageQuotaSetting: function(storageQuota) {
    const adminProjectId = HALO.user.projectId;
    return fetch.put({
      url: '/proxy/cinder/v3/' + adminProjectId +
        '/os-quota-class-sets/default',
      data: {
        quota_class_set: storageQuota
      }
    });
  }
};
