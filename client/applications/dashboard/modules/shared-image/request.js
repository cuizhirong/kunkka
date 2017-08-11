let storage = require('client/applications/dashboard/cores/storage');
let fetch = require('client/applications/dashboard/cores/fetch');
let RSVP = require('rsvp');

module.exports = {
  getList: function(forced) {
    return storage.getList(['image', 'instance', 'network', 'keypair', 'flavor'], forced).then(function(data) {
      return data.image;
    });
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
    let url = '/proxy/gringotts/v2/products/price' +
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
    let data = {};
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
  getShared() {
    let that = this;
    return fetch.get({
      url: '/proxy/glance/v1/shared-images/' + HALO.user.projectId
    }).then(res => {
      let sharedImages = res.shared_images,
        deferredList = [];
      sharedImages.forEach(image => {
        deferredList.push(that.getDetail(image.image_id));
      });
      return RSVP.all(deferredList);
    });
  },
  getDetail(imageId) {
    return fetch.get({
      url: '/proxy/glance/v2/images/' + imageId + '/members/' + HALO.user.projectId
    });
  },
  getImageDetail(members) {
    let deferredList = [];
    deferredList = members.map(member => {
      return fetch.get({
        url: '/proxy/glance/v2/images/' + member.image_id
      });
    });

    return RSVP.all(deferredList);
  },
  updateMember(member, data) {
    return fetch.put({
      url: '/proxy/glance/v2/images/' + member.id + '/members/' + member.member_id,
      data: data
    });
  }
};
