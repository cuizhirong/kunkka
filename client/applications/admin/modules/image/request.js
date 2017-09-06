var fetch = require('../../cores/fetch');
var RSVP = require('rsvp');
var Promise = RSVP.Promise;

function requestParams(obj) {
  var str = '';
  for(let key in obj) {
    if(key === 'name') {
      str += ('&search=' + obj[key]);
    } else {
      str += ('&' + key + '=' + obj[key]);
    }
  }

  return str;
}

function getParams(fields) {
  var ret = '';
  var flag = true;
  for(let f in fields) {
    ret += (flag ? '?' : '&') + f + '=' + fields[f];
    flag = false;
  }
  return ret;
}

module.exports = {
  getList: function(pageLimit) {
    if(isNaN(Number(pageLimit))) {
      pageLimit = 10;
    }

    var url = '/proxy-search/glance/v2/images?limit=' + pageLimit;
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

    function getParameters(fields) {
      let ret = '';
      for(let f in fields) {
        ret += '&' + f + '=' + fields[f];
      }
      return ret;
    }
    var url = '/proxy-search/glance/v2/images?limit=' + pageLimit + getParameters(data);

    return fetch.get({
      url: url
    }).then((res) => {
      res._url = url;
      return res;
    });
  },
  getSingle: function(id) {
    var url = '/proxy-search/glance/v2/images?id=' + id;
    return fetch.get({
      url: url
    }).then((res) => {
      res._url = url;
      return res;
    });
  },
  getNextList: function(nextUrl) {
    var url = nextUrl;
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

    var url = '/proxy-search/glance/v2/images?limit=' + pageLimit + requestParams(data);
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
  updateImage: function(imageID, data) {
    return fetch.patch({
      url: '/api/v1/images/' + imageID,
      data: data
    });
  },
  delete: function(id) {
    return fetch.delete({
      url: '/proxy/glance/v2/images/' + id
    });
  },
  getFieldsList: function() {
    return fetch.get({
      url: '/proxy/csv-field/images'
    });
  },
  exportCSV(fields) {
    let url = '/proxy/csv/glance/v2/images' + getParams(fields);
    function ret() {
      var linkNode = document.createElement('a');
      linkNode.href = url;
      linkNode.click();
      linkNode = null;
      return 1;
    }
    return new Promise((resolve, reject) => {
      resolve(ret());
    });
  },
  getInstances() {
    var url = '/proxy/nova/v2.1/' + HALO.user.projectId + '/servers/detail?all_tenants=1';
    return fetch.get({
      url: url
    }).then(res => {
      return res.servers;
    });
  },
  createTask(data) {
    return fetch.post({
      url: '/proxy/glance/v2/tasks',
      data: data
    });
  }
};
