var fetch = require('../../cores/fetch');

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

module.exports = {
  getHypervisorList: function() {
    var url = '/proxy/nova/v2.1/' + HALO.user.projectId + '/os-hypervisors/detail';
    return fetch.get({
      url: url
    }).then((res) => {
      res._url = url;
      return res;
    });
  },
  getHypervisorByIdOrName: function(str) {
    var url = '/proxy/nova/v2.1/' + HALO.user.projectId + '/os-hypervisors/' + str;
    return fetch.get({
      url: url
    }).then((res) => {
      res._url = url;
      return res;
    });
  },
  getNextList: function(nextUrl) {
    var url = '/proxy/nova/v2.1/' + nextUrl;
    return fetch.get({
      url: url
    }).then((res) => {
      res._url = url;
      return res;
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
  }
};
