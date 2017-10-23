const storage = require('client/applications/dashboard/cores/storage');
const fetch = require('client/applications/dashboard/cores/fetch');
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
  getPrices: function() {
    return fetch.get({
      url: '/proxy/gringotts/v2/products'
    });
  },
  updateImage: function(imageID, data) {
    return fetch.patch({
      url: '/api/v1/images/' + imageID,
      data: data
    });
  },
  getInstances: function() {
    return storage.getList(['instance'], false).then(data => {
      return data.instance;
    });
  },
  createImage: function(data) {
    return fetch.post({
      url: '/proxy/glance/v2/images',
      data: data
    });
  },
  createTask: function(data) {
    return fetch.post({
      url: '/proxy/glance/v2/tasks',
      data: data
    });
  },
  getShared: function() {
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
  getDetail: function(imageId) {
    return fetch.get({
      url: '/proxy/glance/v2/images/' + imageId + '/members/' + HALO.user.projectId
    });
  },
  getImageDetail: function(members) {
    let deferredList = [];
    deferredList = members.map(member => {
      return fetch.get({
        url: '/proxy/glance/v2/images/' + member.image_id
      });
    });

    return RSVP.all(deferredList);
  },
  updateMember: function(member, data) {
    return fetch.put({
      url: '/proxy/glance/v2/images/' + member.id + '/members/' + member.member_id,
      data: data
    });
  },
  deleteImage: function(id) {
    return fetch.delete({
      url: '/proxy/glance/v2/images/' + id
    });
  },
  createMember: function(imageId, id) {
    return fetch.post({
      url: '/proxy/glance/v2/images/' + imageId + '/members',
      data: {member: id}
    });
  }
};
