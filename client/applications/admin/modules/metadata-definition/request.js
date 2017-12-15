const fetch = require('../../cores/fetch');

module.exports = {
  getList: function(pageLimit) {
    if(isNaN(Number(pageLimit))) {
      pageLimit = 10;
    }

    let url = '/proxy/glance/v2/metadefs/namespaces?limit=' + pageLimit;
    return fetch.get({
      url: url
    }).then((res) => {
      res._url = url;
      return res;
    });
  },
  getFilterList: function(data, pageLimit) {
    if (isNaN(Number(pageLimit))) {
      pageLimit = 10;
    }

    const resourceTypes = data.split(' ').join(',');
    let url = '/proxy/glance/v2/metadefs/namespaces?limit=' + pageLimit + '&resource_types=' + resourceTypes;

    return fetch.get({
      url: url
    }).then((res) => {
      res._url = url;
      return res;
    });
  },
  getSingle: function(namespace) {
    let url = '/proxy/glance/v2/metadefs/namespaces/' + namespace;
    return fetch.get({
      url: url
    }).then((res) => {
      const _res = {};
      _res._url = url;
      _res.namespaces = [res];
      return _res;
    });
  },
  getNextList: function(nextUrl) {
    let url = nextUrl;
    let getSingle;
    let index = nextUrl.indexOf('namespaces');
    if(nextUrl[index + 'namespaces'.length] === '/') {
      getSingle = true;
    } else {
      getSingle = false;
    }

    return fetch.get({
      url: url
    }).then((res) => {
      let _res = {};
      if(getSingle) {
        _res.namespaces = [res];
      } else {
        _res = res;
      }

      _res._url = url;
      return _res;
    });
  },
  updateNamespace: function(namespace, visibility, isProtected) {
    let url = '/proxy/glance/v2/metadefs/namespaces/' + namespace.namespace;

    return fetch.put({
      url: url,
      data: {
        namespace: namespace.namespace,
        description: namespace.description,
        display_name: namespace.display_name,
        visibility: visibility,
        protected: isProtected
      }
    });
  },
  deleteNamespace: function(namespace) {
    return fetch.delete({
      url: '/proxy/glance/v2/metadefs/namespaces/' + namespace
    });
  }
};
