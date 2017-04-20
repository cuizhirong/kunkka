var storage = require('client/applications/dashboard/cores/storage');
var fetch = require('client/applications/dashboard/cores/fetch');
var RSVP = require('rsvp');

module.exports = {
  getList: function(forced) {
    return storage.getList(['image', 'instance', 'network', 'keypair', 'flavor'], forced).then(function(data) {
      return data.image;
    });
  },
  deleteImage: function(items) {
    var deferredList = [];
    items.forEach((item) => {
      if (item.image_type === 'snapshot') {
        deferredList.push(fetch.delete({
          url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/images/' + item.id
        }));
      }
    });
    return RSVP.all(deferredList);
  },
  getOverview: function() {
    return fetch.get({
      url: '/api/v1/' + HALO.user.projectId + '/overview'
    });
  },
  getVolumeTypes: function() {
    return fetch.get({
      url: '/proxy/cinder/v2/' + HALO.user.projectId + '/types'
    });
  },
  getVolumePrice: function(type, size) {
    var url = '/proxy/gringotts/v2/products/price' +
      '?purchase.bill_method=hour' +
      '&purchase.purchases[0].product_name=' + type +
      '&purchase.purchases[0].service=block_storage' +
      '&purchase.purchases[0].region_id=' + HALO.current_region +
      '&purchase.purchases[0].quantity=' + size;

    return fetch.get({
      url: url
    });
  },
  getPrices: function() {
    return fetch.get({
      url: '/proxy/gringotts/v2/products'
    });
  },
  createVolume: function(_data) {
    var data = {};
    data.volume = _data;

    return fetch.post({
      url: '/proxy/cinder/v2/' + HALO.user.projectId + '/volumes',
      data: data
    });
  },
  getInstances: function() {
    return storage.getList(['instance'], false).then(data => {
      return data.instance;
    });
  },
  updateImage: function(imageID, data) {
    return fetch.patch({
      url: '/api/v1/images/' + imageID,
      data: data
    });
  },
  createImage(data) {
    return fetch.post({
      url: '/proxy/glance/v2/images',
      data: data
    });
  }
};
