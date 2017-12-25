let fetch = require('../../cores/fetch');
let RSVP = require('rsvp');

module.exports = {
  getList: function(forceUpdate) {
    return fetch.get({
      url: '/proxy-search/glance/v2/images?image_type=image&visibility=private'
    }).then(function(data) {
      return data.list;
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
  getInstances: function() {
    let url = '/proxy/nova/v2.1/' + HALO.user.projectId + '/servers/detail?all_tenants=1';
    return fetch.get({
      url: url
    }).then(res => {
      return res.servers;
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
  getMetadata: function() {
    let namespaces;

    return fetch.get({
      url: '/proxy/glance/v2/metadefs/namespaces?resource_types=OS::Glance::Image'
    }).then((res) => {
      namespaces = res.namespaces.sort((a, b) => {
        return a.display_name.localeCompare(b.display_name);
      });
      const detailRequests = [];
      namespaces.forEach((namespace) => {
        detailRequests.push(fetch.get({
          url: '/proxy/glance/v2/metadefs/namespaces/' + namespace.namespace + '?resource_type=OS::Glance::Image'
        }));
      });
      return RSVP.all(detailRequests);
    }).then((details) => {
      namespaces.forEach((namespace, index) => {
        namespace.properties = details[index].properties;
        namespace.objects = details[index].objects;
      });
      return namespaces;
    });
  }
};
