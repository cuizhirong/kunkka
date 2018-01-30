const fetch = require('../../cores/fetch');
const RSVP = require('rsvp');
const download = require('client/utils/download');

function getParameters(fields) {
  let ret = '';
  for(let f in fields) {
    ret += '&' + f + '=' + fields[f];
  }
  return ret;
}

function getRatelimitById(fipId) {
  return fetch.get({
    url: '/proxy/neutron/v2.0/uplugin/fipratelimits/' + fipId
  }).then((res) => {
    return res;
  }).catch(() => {
    return {
      fipratelimit: {}
    };
  });
}

function getRatelimitList() {
  return fetch.get({
    url: '/proxy/neutron/v2.0/uplugin/fipratelimits'
  }).then((res) => {
    return res;
  }).catch(() => {
    return {
      fipratelimits: []
    };
  });
}

function transformListToMap(list) {
  const map = {};
  list.forEach((item) => {
    map[item.floatingip_id] = item;
  });
  return map;
}

module.exports = {
  getList: function(pageLimit, enableRatelimit) {
    if(isNaN(Number(pageLimit))) {
      pageLimit = 10;
    }

    let url = '/proxy/neutron/v2.0/floatingips?all_tenants=1&limit=' + pageLimit;

    const reqs = {
      fips: fetch.get({
        url: url
      })
    };
    if(enableRatelimit) {
      reqs.ratelimits = getRatelimitList();
    }

    return RSVP.hash(reqs).then(res => {
      const _res = res.fips;
      _res._url = url;
      if(enableRatelimit) {
        const map = transformListToMap(res.ratelimits.fipratelimits);
        _res.floatingips.forEach((fip) => {
          if(fip.id in map) {
            fip.fipratelimit = map[fip.id].rate;
          }
        });
      }
      return _res;
    });
  },
  getFilterList: function(data, pageLimit, enableRatelimit) {
    if (isNaN(Number(pageLimit))) {
      pageLimit = 10;
    }
    let url = '/proxy/neutron/v2.0/floatingips?all_tenants=1&limit=' + pageLimit + getParameters(data);

    const reqs = {
      fips: fetch.get({
        url: url
      })
    };
    if(enableRatelimit) {
      reqs.ratelimits = getRatelimitList();
    }

    return RSVP.hash(reqs).then(res => {
      const _res = res.fips;
      _res._url = url;
      if(enableRatelimit) {
        const map = transformListToMap(res.ratelimits.fipratelimits);
        _res.floatingips.forEach((fip) => {
          if(fip.id in map) {
            fip.fipratelimit = map[fip.id].rate;
          }
        });
      }
      return _res;
    });
  },
  getServerByID: function(serverID) {
    let url = '/proxy/nova/v2.1/' + HALO.user.projectId + '/servers/' + serverID;
    return fetch.get({
      url: url
    }).then((res) => {
      return res;
    }).catch((res) => {
      res._url = url;
      return res;
    });
  },
  getNextList: function(nextUrl, enableRatelimit) {
    let url = '/proxy/neutron/v2.0/' + nextUrl;

    const reqs = {
      fips: fetch.get({
        url: url
      })
    };
    if(enableRatelimit) {
      reqs.ratelimits = getRatelimitList();
    }

    return RSVP.hash(reqs).then(res => {
      const _res = res.fips;
      _res._url = url;
      if(enableRatelimit) {
        const map = transformListToMap(res.ratelimits.fipratelimits);

        if(_res.floatingip !== undefined) {
          // 以列表的形式获取单个 FIP 时需要特殊处理一下
          _res.floatingip.fipratelimit = map[_res.floatingip.id].rate;
        } else {
          _res.floatingips.forEach((fip) => {
            if(fip.id in map) {
              fip.fipratelimit = map[fip.id].rate;
            }
          });
        }
      }
      return _res;
    });
  },
  getFloatingIPByID: function(floatingipID, enableRatelimit) {
    let url = '/proxy/neutron/v2.0/floatingips/' + floatingipID;

    const reqs = {
      fip: fetch.get({
        url: url
      })
    };
    if(enableRatelimit) {
      reqs.ratelimit = getRatelimitById(floatingipID);
    }

    return RSVP.hash(reqs).then(res => {
      const _res = res.fip;
      _res._url = url;
      if(enableRatelimit) {
        _res.floatingip.fipratelimit = res.ratelimit.fipratelimit.rate;
      }
      return _res;
    });
  },
  dissociateFloatingIp: function(fipID, data) {
    return fetch.put({
      url: '/proxy/neutron/v2.0/floatingips/' + fipID,
      data: data
    });
  },
  getRelatedSourcesById: function(item) {
    let deferredList = [];

    if(item.router_id) {
      deferredList.push(fetch.get({
        url: '/proxy/neutron/v2.0/routers/' + item.router_id
      }).then((res) => {
        item.router_name = res.router.name;
      }));
    }

    if(item.port_id) {
      deferredList.push(fetch.get({
        url: '/proxy/neutron/v2.0/ports/' + item.port_id
      }).then((res) => {
        let port = res.port;
        if(port.device_owner.indexOf('compute') === 0) {
          item.server_id = port.device_id;
          return port.device_id;
        }
      }).then((res) => {
        if(res) {
          return fetch.get({
            url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/servers/' + res
          });
        }
      }
      ).then((inst) => {
        if(inst) {
          let server = inst.server;
          item.server_name = server.name;
        }
      }));
    }
    return RSVP.all(deferredList);
  },
  allocateFloatingIP: function(data) {
    return fetch.post({
      url: '/proxy/neutron/v2.0/floatingips',
      data: data
    });
  },
  getExternalNetwork: function(projectId) {
    return fetch.get({
      url: '/proxy/neutron/v2.0/networks?router:external=true'
    });
  },
  getFieldsList: function() {
    return fetch.get({
      url: '/proxy/csv-field/floatingips'
    });
  },
  exportCSV(fields) {
    let url = '/proxy/csv/neutron/v2.0/floatingips?all_tenants=1' + getParameters(fields);
    return download(url);
  }
};
