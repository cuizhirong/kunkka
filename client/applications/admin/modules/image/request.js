const fetch = require('../../cores/fetch');
const RSVP = require('rsvp');
const Promise = RSVP.Promise;

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

function getParams(fields) {
  let ret = '';
  let flag = true;
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

    let url = '/proxy-search/glance/v2/images?image_type=image&visibility=public&limit=' + pageLimit;
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
    let url = '/proxy-search/glance/v2/images?image_type=image&visibility=public&limit=' + pageLimit + getParameters(data);

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
  getNextList: function(nextUrl) {
    let url = nextUrl;
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

    let url = '/proxy-search/glance/v2/images?limit=' + pageLimit + requestParams(data);
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
  createImage: function(data) {
    return fetch.post({
      url: '/proxy/glance/v2/images',
      data: data
    });
  },
  exportCSV: function(fields) {
    let url = '/proxy/csv/glance/v2/images' + getParams(fields);
    function ret() {
      let linkNode = document.createElement('a');
      linkNode.href = url;
      linkNode.click();
      linkNode = null;
      return 1;
    }
    return new Promise((resolve, reject) => {
      resolve(ret());
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
  createTask: function(data) {
    return fetch.post({
      url: '/proxy/glance/v2/tasks',
      data: data
    });
  }
};
