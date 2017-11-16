const storage = require('client/applications/approval/cores/storage');
const fetch = require('client/applications/approval/cores/fetch');
const RSVP = require('rsvp');

module.exports = {
  getList: function(forced) {
    return storage.getList(['image', 'instance', 'network', 'keypair', 'flavor'], forced).then(function(data) {
      return data.image;
    });
  },
  deleteImage: function(items) {
    let deferredList = [];
    items.forEach((item) => {
      if (item.image_type === 'snapshot') {
        deferredList.push(fetch.delete({
          url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/images/' + item.id
        }));
      }
    });
    return RSVP.all(deferredList);
  }
};
