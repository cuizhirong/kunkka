var fetch = require('../../cores/fetch');

module.exports = {
  getList: function() {
    var url = '/proxy/nova/v2.1/' + HALO.user.projectId + '/flavors/detail';
    return fetch.get({
      url: url
    }).then((res) => {
      res._url = url;
      return res;
    });
  },
  getFlavorById: function(id) {
    var url = '/proxy/nova/v2.1/' + HALO.user.projectId + '/flavors/' + id;
    return fetch.get({
      url: url
    }).then((res) => {
      res._url = url;
      return res;
    });
  },
  getNextList: function(nextUrl) {
    var url = '/proxy/nova/v2.1/' + nextUrl;
    return fetch.get({
      url: url
    }).then((res) => {
      res._url = url;
      return res;
    });
  },
  createFlavor: function(data) {
    return fetch.post({
      url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/flavors',
      data: data
    });
  },
  deleteItem: function(flavorID) {
    return fetch.delete({
      url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/flavors/' + flavorID
    });
  },
  createExtraSpecs: function(flavorID, dataSpecs) {
    return fetch.post({
      url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/flavors/' + flavorID + '/os-extra_specs',
      data: {'extra_specs': dataSpecs}
    });
  },
  getExtraSpecs: function(flavorID) {
    return fetch.get({
      url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/flavors/' + flavorID + '/os-extra_specs'
    });
  }
};
