let fetch = require('../../cores/fetch');
let RSVP = require('rsvp');

function requestParams(obj) {
  let str = '';
  for(let key in obj) {
    if(key === 'name') {
      str += ('&search=' + obj[key]);
    } else {
      str += ('&' + key + '=' + obj[key]);
    }
  }

  return str;
}

module.exports = {
  getList: function(pageLimit) {
    if(isNaN(Number(pageLimit))) {
      pageLimit = 10;
    }
    let url = '/proxy-search/glance/v2/images?image_type=image&status=deactivated&limit=' + pageLimit;

    return fetch.get({
      url: url
    }).then(function(res) {
      res._url = url;
      return res;
    });
  },
  getNextList: function(nextUrl) {
    let url = nextUrl;
    return fetch.get({
      url: url
    }).then((res) => {
      res._url = url;
      return res;
    });
  },
  getSingle: function(id) {
    let url = '/proxy-search/glance/v2/images?id=' + id;
    return fetch.get({
      url: url
    }).then((res) => {
      res._url = url;
      return res;
    });
  },
  filter: function(data, pageLimit) {
    if(isNaN(Number(pageLimit))) {
      pageLimit = 10;
    }

    let url = '/proxy-search/glance/v2/images?image_type=image&status=deactivated&limit=' + pageLimit + requestParams(data);
    return fetch.get({
      url: url
    }).then((res) => {
      res._url = url;
      return res;
    }).catch((res) => {
      res._url = url;
      return res;
    });
  },
  getInstances: function(imageId) {
    let url = '/proxy/nova/v2.1/' + HALO.user.projectId + '/servers/detail?all_tenants=1&image=' + imageId;
    return fetch.get({
      url: url
    }).then(res => {
      return res.servers;
    });
  },
  deleteImage: function(id) {
    return fetch.delete({
      url: '/proxy/glance/v2/images/' + id
    });
  },
  reactivateImages: function(images) {
    const reqs = images.map((image) => {
      return fetch.post({
        url: '/proxy/glance/v2/images/' + image.id + '/actions/reactivate'
      });
    });

    return RSVP.all(reqs);
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
