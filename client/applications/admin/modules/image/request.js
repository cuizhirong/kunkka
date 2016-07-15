var fetch = require('../../cores/fetch');

function requestParams(obj) {
  var str = '';
  for(let key in obj) {
    str += ('&' + key + '=' + obj[key]);
  }

  return str;
}

module.exports = {
  getList: function(pageLimit) {
    if(isNaN(Number(pageLimit))) {
      pageLimit = 10;
    }

    var url = '/proxy/glance/v2/images?limit=' + pageLimit;
    return fetch.get({
      url: url
    }).then((res) => {
      res._url = url;
      return res;
    });
  },
  getSingle: function(id) {
    var url = '/proxy/glance/v2/images/' + id;
    return fetch.get({
      url: url
    }).then((res) => {
      res._url = url;
      return res;
    });
  },
  getNextList: function(nextUrl) {
    var url = '/proxy/glance/v2/' + nextUrl;
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

    var url = '/proxy/glance/v2/images?limit=' + pageLimit + requestParams(data);
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
  editName: function(imageID, data) {
    return fetch.patch({
      url: '/api/v1/images/' + imageID,
      data: data
    });
  },
  delete: function(id) {
    return fetch.delete({
      url: '/proxy/glance/v2/images/' + id
    });
  }
};
