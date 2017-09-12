const fetch = require('../../cores/fetch');
const RSVP = require('rsvp');

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

    let url = '/proxy-search/keystone/v3/roles';
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
  getNextList: function(nextUrl) {
    let url = nextUrl;
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
  getFilteredList: function(data, pageLimit) {
    if(isNaN(Number(pageLimit))) {
      pageLimit = 10;
    }

    let url = '/proxy-search/keystone/v3/roles?limit=' + pageLimit + requestParams(data);
    return fetch.get({
      url: url
    }).then((res) => {
      res._url = url;
      return res;
    });
  },
  getRoleByID: function(roleID) {
    let url = '/proxy-search/keystone/v3/roles?id=' + roleID;
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
  getRoles: function() {
    return fetch.get({
      url: '/proxy/keystone/v3/roles'
    });
  },
  deleteItem: function(items) {
    let deferredList = [];
    items.forEach((item) => {
      deferredList.push(fetch.delete({
        url: '/proxy/keystone/v3/roles/' + item.id
      }));
    });
    return RSVP.all(deferredList);
  },
  createRole: function(data) {
    return fetch.post({
      url: '/proxy/keystone/v3/roles',
      data: {
        role: data
      }
    });
  },
  editRole: function(roleID, data) {
    return fetch.patch({
      url: '/proxy/keystone/v3/roles/' + roleID,
      data: {
        role: data
      }
    });
  }
};
