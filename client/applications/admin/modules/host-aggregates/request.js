const fetch = require('../../cores/fetch');
const RSVP = require('rsvp');

module.exports = {
  getAggregatesList: function() {
    return fetch.get({
      url: '/proxy/nova/v2.1/os-aggregates'
    }).then((res) => {
      return this.getHostsList().then((_res) => {
        res.aggregates.forEach((item) => {
          item.hosts_list = _res.hypervisors;
        });
        return res;
      });
    });
  },
  getHostsList: function() {
    return fetch.get({
      url: '/api/v1/' + HALO.user.projectId + '/os-hypervisors/detail'
    });
  },
  getServicesList: function() {
    let url = '/proxy/nova/v2.1/os-services';
    return fetch.get({
      url: url
    }).then((res) => {
      let ret = [];
      return this.getAvailabilityZone().then((_res) => {
        _res.availabilityZoneInfo.forEach((item) => {
          let f = res.services.filter(r => r.zone === item.zoneName);
          ret = ret.concat(f);
        });
        return ret;
      });
    });
  },
  getAvailabilityZone: function() {
    let url = '/proxy/nova/v2.1/os-availability-zone';
    return fetch.get({
      url: url
    });
  },
  getAggregateById: function(id) {
    return fetch.get({
      url: '/proxy/nova/v2.1/os-aggregates/' + id
    }).then((res) => {
      return this.getHostsList().then((_res) => {
        res.aggregate.hosts_list = _res.hypervisors;
        return res;
      });
    });
  },
  createAggregate: function(data, list) {
    let url = '/proxy/nova/v2.1/os-aggregates';
    return fetch.post({
      url: url,
      data: data
    }).then((res) => {
      if(list.addList && list.addList.length) {
        return this.manageHosts(res.aggregate.id, list);
      }
      return res;
    });
  },
  addHost: function(id, hostIds) {
    let url = '/proxy/nova/v2.1/os-aggregates/' + id + '/action';
    return fetch.post({
      url: url
    });
  },
  updateMetaData: function(id, metadata) {
    let url = '/proxy/nova/v2.1/os-aggregates/' + id + '/action';
    return fetch.post({
      url: url,
      data: metadata
    });
  },
  updateAggregate: function(id, data) {
    let url = '/proxy/nova/v2.1/os-aggregates/' + id;
    return fetch.put({
      url: url,
      data: data
    });
  },
  manageHosts: function(id, list) {
    let manageList = [];
    if(list.addList && list.addList.length) {
      list.addList.forEach((a) => {
        manageList.push(fetch.post({
          url: '/proxy/nova/v2.1/os-aggregates/' + id + '/action',
          data: {
            add_host: {
              host: a
            }
          }
        }));
      });
    }
    if(list.removeList && list.removeList.length) {
      list.removeList.forEach((r) => {
        manageList.push(fetch.post({
          url: '/proxy/nova/v2.1/os-aggregates/' + id + '/action',
          data: {
            remove_host: {
              host: r
            }
          }
        }));
      });
    }
    return RSVP.all(manageList);
  },
  getAllMetaData: function() {
    let pList = [];
    let rtList = [];
    let namespaces;
    let url = '/proxy/glance/v2/metadefs/namespaces?resource_types=OS::Nova::Aggregate';
    return fetch.get({
      url: url
    }).then((res) => {
      namespaces = res.namespaces;
      namespaces.forEach((namespace) => {
        pList.push(fetch.get({
          url: '/proxy/glance/v2/metadefs/namespaces/' + namespace.namespace + '/properties'
        }));
      });
      return RSVP.all(pList);
    }).then((res) => {
      namespaces.forEach((namespace) => {
        rtList.push(fetch.get({
          url: '/proxy/glance/v2/metadefs/namespaces/' + namespace.namespace + '/resource_types'
        }));
      });
      res.forEach((p, i) => {
        namespaces[i].properties = p.properties;
      });
      return RSVP.all(rtList).then((resourceTypes) => {
        resourceTypes.forEach((rt, i) => {
          let rtassociations = rt.resource_type_associations.find(rta => rta.name === 'OS::Nova::Aggregate');
          Object.keys(namespaces[i].properties).forEach((np) => {
            namespaces[i].properties[np].prefix = rtassociations.prefix ? rtassociations.prefix : null;
            namespaces[i].properties[np].metadata_name = (rtassociations.prefix ? rtassociations.prefix : '') + np;
          });
        });
        return namespaces;
      });
    });
  },
  deleteItems: function(rows) {
    let deferredList = rows.map((item) => fetch.delete({
      url: '/proxy/nova/v2.1/os-aggregates/' + item.id
    }));
    return RSVP.all(deferredList);
  }
};
