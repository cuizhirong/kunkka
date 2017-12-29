const fetch = require('../libs/fetch');
const RSVP = require('rsvp');

// 拿所有的配置
function getFlavors() {
  let url = '/proxy/nova/v2.1/' + HALO.user.projectId + '/flavors/detail';
  return fetch.get({
    url: url
  });
}

// 拿所有的volume types
function getVolumeTypes() {
  let url = '/proxy/cinder/v2/' + HALO.user.projectId + '/types';
  return fetch.get({
    url: url
  });
}

module.exports = {
  getList: function() {
    return getVolumeTypes().then(volumeTyps => {
      let serviceUrl = '/proxy/cloudkitty/v1/rating/module_config/hashmap/services';
      let resources = [];
      let mappings = [];
      /**
       * @volumeTypes: array
       * @services:    array
       * @flavors:     array
       * @field_ids:   array
       * @mappings:    array
       */
      HALO.stash = {};
      HALO.stash.volume_types = volumeTyps.volume_types;
      // get all services
      return getFlavors().then(f => {
        HALO.stash.flavors = f.flavors;
        return fetch.get({
          url: serviceUrl
        }).then((res) => {
          HALO.stash.services = res.services;
          let servicesList = [];
          res.services.forEach((s) => {
            // 如果name为compute和volume.volume，需要先拿到fields列表，然后通过field_id来拿mapping.
            // compute为flavor_id
            // volume.volume为volume_type
            let isField = s.name === 'compute' || s.name === 'volume.volume';
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
            } else if(r.fields.length > 0) {
              // compute下只有一个flavor_id
              // volume.volume下只有一个volume_type的id
              // 将两者暂存，用于修改价格用.
              r.fields.forEach((field) => {
                if(field.name === 'flavor_id') {
                  HALO.stash.flavor_id = field.field_id;
                } else if(field.name === 'volume_type') {
                  HALO.stash.volume_type = field.field_id;
                }
                fieldList.push(fetch.get({
                  url: `/proxy/cloudkitty/v1/rating/module_config/hashmap/mappings?field_id=${field.field_id}`
                }));
              });
            }
          });
          return RSVP.all(fieldList);
        }).then((res) => {
          // 给mapping加上resource_type，通过对比field_id和所暂存的
          // flavor_id和volume_type得出mapping的resource_type
          res.forEach((r) => {
            r.mappings.forEach(m => {
              if(m.field_id === HALO.stash.flavor_id) {
                m.resource_type = 'compute';
              } else {
                m.resource_type = 'volume.volume';
              }
            });
            mappings = mappings.concat(r.mappings);
          });
          // 给mapping加上name
          mappings.map(m => {
            m.id = m.mapping_id;
            f.flavors.some(flavor => {
              if(m.value === flavor.id) {
                m.name = flavor.name;
                return true;
              }
              return false;
            });
            volumeTyps.volume_types.some(type => {
              if(m.value === type.id) {
                m.name = type.name;
                return true;
              }
              return false;
            });
          });
          HALO.stash.mappings = mappings;
          return mappings;
        });
      });
    });
  }
};
