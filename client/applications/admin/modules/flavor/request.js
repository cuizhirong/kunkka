var fetch = require('../../cores/fetch');
var RSVP = require('rsvp');

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
      data: dataSpecs
    });
  },
  updateExtraSpecs: function(flavorID, dataSpecs) {
    var deferredList = [], data = {};
    dataSpecs.forEach(ele => {
      data = {};
      data[ele.key] = ele.value;
      deferredList.push(fetch.put({
        url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/flavors/' + flavorID + '/os-extra_specs/' + ele.key,
        data: data
      }));
    });
    return RSVP.all(deferredList);
  },
  deleteExtraSpecs: function(flavorID, items) {
    var deferredList = [];
    items.forEach((item) => {
      deferredList.push(fetch.delete({
        url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/flavors/' + flavorID + '/os-extra_specs/' + item
      }));
    });
    return RSVP.all(deferredList);
  },
  createAndUpdateAndDeleteSpect: function(flavorID, updateSpecs, deleteSpecs, createSepcs) {
    var list = [];
    list.push(this.updateExtraSpecs(flavorID, updateSpecs));
    list.push(this.deleteExtraSpecs(flavorID, deleteSpecs));
    list.push(this.createExtraSpecs(flavorID, createSepcs));
    return RSVP.all(list);
  },
  getExtraSpecs: function(flavorID) {
    return fetch.get({
      url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/flavors/' + flavorID + '/os-extra_specs'
    });
  }
};
