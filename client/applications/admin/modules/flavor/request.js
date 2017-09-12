const fetch = require('../../cores/fetch');
const RSVP = require('rsvp');

module.exports = {
  getList: function() {
    let url = '/proxy/nova/v2.1/' + HALO.user.projectId + '/flavors/detail';
    return fetch.get({
      url: url
    }).then((res) => {
      res._url = url;
      return res;
    });
  },
  getFlavorById: function(id) {
    let url = '/proxy/nova/v2.1/' + HALO.user.projectId + '/flavors/' + id;
    return fetch.get({
      url: url
    }).then((res) => {
      res._url = url;
      return res;
    });
  },
  getNextList: function(nextUrl) {
    let url = '/proxy/nova/v2.1/' + nextUrl;
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
    let deferredList = [], data = {};
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
    let deferredList = [];
    items.forEach((item) => {
      deferredList.push(fetch.delete({
        url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/flavors/' + flavorID + '/os-extra_specs/' + item
      }));
    });
    return RSVP.all(deferredList);
  },
  createAndUpdateAndDeleteSpect: function(flavorID, updateSpecs, deleteSpecs, createSepcs) {
    let list = [];
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
