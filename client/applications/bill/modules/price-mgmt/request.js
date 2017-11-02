const fetch = require('../../cores/fetch');
const RSVP = require('rsvp');

module.exports = {
  getList: function() {
    let serviceUrl = '/proxy/cloudkitty/v1/rating/module_config/hashmap/services';
    let resources = [];
    let mappings = [];
    /**
     * @services:  array
     * @flavors:   array
     * @field_ids: array
     * @mappings:  array
     */
    HALO.stash = {};
    HALO.stash.field_id = '';
    // get all services
    return this.getFlavors().then(f => {
      HALO.stash.flavors = f.flavors;
      return fetch.get({
        url: serviceUrl
      }).then((res) => {
        HALO.stash.services = res.services;
        let servicesList = [];
        res.services.forEach((s) => {
          // if service is compute or router, get hashmap field, others get hashmap mappings.
          let isField = s.name === 'compute';
          let mappingUrl = `/proxy/cloudkitty/v1/rating/module_config/hashmap/mappings?service_id=${s.service_id}`;
          let fieldUrl = `/proxy/cloudkitty/v1/rating/module_config/hashmap/fields?service_id=${s.service_id}`;
          servicesList.push(isField ? fetch.get({
            url: fieldUrl
          }) : fetch.get({
            url: mappingUrl
          }));
          resources.push(s.name);
        });
        return RSVP.all(servicesList);
      }).then((res) => {
        let fieldList = [];
        res.forEach((r, i) => {
          if(r.mappings) {
            r.mappings.forEach((m) => {
              m.resource_type = resources[i];
              mappings.push(m);
            });
          } else if(r.fields) {
            r.fields.forEach((field) => {
              HALO.stash.field_id = field.field_id;
              fieldList.push(fetch.get({
                url: `/proxy/cloudkitty/v1/rating/module_config/hashmap/mappings?field_id=${field.field_id}`
              }));
            });
          }
        });
        return RSVP.all(fieldList);
      }).then((res) => {
        res.forEach((r) => {
          r.mappings.forEach(m => {
            m.resource_type = 'compute';
          });
          mappings = mappings.concat(r.mappings);
        });
        mappings.map(m => {
          m.id = m.mapping_id;
          f.flavors.some(flavor => {
            if(m.value === flavor.id) {
              m.name = flavor.name;
              return true;
            }
            return false;
          });
        });
        HALO.stash.mappings = mappings;
        return mappings;
      });
    });
  },
  getFlavors: function() {
    let url = '/proxy/nova/v2.1/' + HALO.user.projectId + '/flavors/detail';
    return fetch.get({
      url: url
    });
  },
  deleteItem: function(items) {
    let deferredList = [];
    items.forEach((item) => {
      deferredList.push(fetch.delete({
        url: '/proxy/cloudkitty/v1/rating/module_config/hashmap/mappings/' + item.mapping_id
      }));
    });
    return RSVP.all(deferredList);
  },
  createMapping: function(data) {
    return fetch.post({
      url: '/proxy/cloudkitty/v1/rating/module_config/hashmap/mappings/',
      data: data
    });
  },
  updateMapping: function(mappingId, data) {
    return fetch.put({
      url: '/proxy/cloudkitty/v1/rating/module_config/hashmap/mappings/' + mappingId,
      data: data
    });
  }
};
