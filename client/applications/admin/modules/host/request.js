var fetch = require('../../cores/fetch');
var RSVP = require('rsvp');
var Promise = RSVP.Promise;

function migrateLiveServer(id, hostID) {
  var data = {
    'os-migrateLive': {
      host: hostID,
      block_migration: false,
      disk_over_commit: false
    }
  };

  return fetch.post({
    url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/servers/' + id + '/action',
    data: data
  });
}

function migrateInactivateServer(id, hostID) {
  var data = {
    migrate: null
  };

  return fetch.post({
    url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/servers/' + id + '/action',
    data: data
  });
}

function getAllHypervisors() {
  let url = '/api/v1/' + HALO.user.projectId + '/os-hypervisors/detail';
  return fetch.get({
    url: url
  }).then((res) => {
    return res;
  });
}

function getParameters(fields) {
  let ret = '';
  for(let f in fields) {
    ret += '&' + f + '=' + fields[f];
  }
  return ret;
}

module.exports = {
  getHypervisorList: function(pageLimit) {
    if(isNaN(Number(pageLimit))) {
      pageLimit = 10;
    }

    var url = '/api/v1/' + HALO.user.projectId + '/os-hypervisors/detail?limit=' + pageLimit;
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
    var url = '/api/v1/' + HALO.user.projectId + '/os-hypervisors/detail?limit=' + pageLimit + getParameters(data);
    return fetch.get({
      url: url
    }).then((res) => {
      res._url = url;
      return res;
    });
  },
  getHypervisorById: function(str) {
    var url = '/proxy/nova/v2.1/' + HALO.user.projectId + '/os-hypervisors/' + str;
    return fetch.get({
      url: url
    }).then((res) => {
      res._url = url;
      return res;
    });
  },
  getNextList: function(nextUrl) {
    //var url = '/api/v1/' + HALO.user.projectId + '/os-hypervisors/detail' + nextUrl;
    return fetch.get({
      url: nextUrl
    }).then((res) => {
      res._url = nextUrl;
      return res;
    });
  },
  getListByName: function(name) {

    return getAllHypervisors().then((res) => {
      var url = '/proxy/nova/v2.1/' + HALO.user.projectId + '/os-hypervisors/' + name + '/search';
      return fetch.get({
        url: url
      }).then((r) => {
        let filterlist = res.hypervisors.filter((h) => {
          return r.hypervisors.some((i) => {
            return i.id === h.id;
          });
        });
        res.hypervisors = filterlist;
        res._url = url;
        return res;
      }).catch((result) => {
        result._url = url;
        return result;
      });
    });
  },
  disableHost: function(data) {
    return fetch.put({
      url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/os-services/disable',
      data: data
    });
  },
  enableHost: function(data) {
    return fetch.put({
      url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/os-services/enable',
      data: data
    });
  },
  migrate: function(source, dest, randomly) {
    return fetch.get({
      url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/servers/detail?all_tenants=1&host=' + source
    }).then((res) => {
      res.servers.forEach((server) => {
        var status = server.status.toLowerCase();
        if (status === 'active') {
          migrateLiveServer(server.id, dest);
        } else if (status === 'shutoff' && randomly) {
          migrateInactivateServer(server.id, dest);
        }
      });
    });
  },
  getCSVField: function() {
    return fetch.get({
      url: '/proxy/csv-field/os-hypervisors'
    });
  },
  exportCSV(fields) {
    let url = '/proxy/csv/nova/v2.1/' + HALO.user.projectId + '/os-hypervisors/detail?all_tenants=1' + getParameters(fields);
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
  }
};
