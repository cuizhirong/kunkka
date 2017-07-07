var fetch = require('../../cores/fetch');
var RSVP = require('rsvp');

const PROJECT_ID = HALO.user.projectId;

module.exports = {

  createEncryption: function(id, data) {
    return fetch.post({
      url: '/proxy/cinder/v2/' + PROJECT_ID + '/types/' + id + '/encryption',
      data: data
    });
  },
  createType: function(data) {
    return fetch.post({
      url: '/proxy/cinder/v2/' + PROJECT_ID + '/types',
      data: data
    });
  },
  deleteAndUpdateExtraSpecs: function(id, { updateData, deleteKeys }) {
    let list = [];
    list.push(this.updateExtraSpecs(id, updateData));
    list.push(this.deleteExtraSpecs(id, deleteKeys));

    return RSVP.all(list);
  },
  deleteEncryption: function(id, encryptionId) {
    return fetch.delete({
      url: '/proxy/cinder/v2/' + PROJECT_ID + '/types/' + id + '/encryption/' + encryptionId
    });
  },
  deleteExtraSpecs: function(id, keys) {
    let list = keys.map((key) => fetch.delete({
      url: '/proxy/cinder/v2/' + PROJECT_ID + '/types/' + id + '/extra_specs/' + key
    }));

    return RSVP.all(list);
  },
  deleteTypes: function(ids) {
    let list = ids.map((id) => fetch.delete({
      url: '/proxy/cinder/v2/' + PROJECT_ID + '/types/' + id
    }));

    return RSVP.all(list);
  },
  getEncryption: function(id) {
    return fetch.get({
      url: '/proxy/cinder/v2/' + PROJECT_ID + '/types/' + id + '/encryption'
    });
  },
  getList: function() {
    let url = '/proxy/cinder/v2/' + PROJECT_ID + '/types?is_public=none';

    return this.getQosSpecs().then((resQos) => {
      let specs = resQos.qos_specs;
      return fetch.get({
        url: url
      }).then((res) => {
        res.volume_types = res.volume_types.map((type) => {
          if (type.qos_specs_id) {
            type._qos_specs = specs.find((spec) => spec.id === type.qos_specs_id);
          }
          return type;
        });
        res._url = url;
        return res;
      });
    });
  },
  getNextList: function(url) {
    return fetch.get({
      url: url
    }).then((res) => {
      res._url = url;
      return res;
    });
  },
  getQosSpecs: function() {
    let url = '/proxy/cinder/v2/' + PROJECT_ID + '/qos-specs';
    return fetch.get({
      url: url
    });
  },
  getSingle: function(id) {
    let url = '/proxy/cinder/v2/' + PROJECT_ID + '/types/' + id;
    return fetch.get({
      url: url
    }).then((res) => {
      res._url = url;
      return res;
    });
  },
  updateEncryption: function(id, encryptionId, data) {
    return fetch.put({
      url: '/proxy/cinder/v2/' + PROJECT_ID + '/types/' + id + '/encryption/' + encryptionId,
      data: data
    });
  },
  updateExtraSpecs: function(id, data) {
    return fetch.post({
      url: '/proxy/cinder/v2/' + PROJECT_ID + '/types/' + id + '/extra_specs',
      data: data
    });
  },
  updateType: function(id, data) {
    return fetch.put({
      url: '/proxy/cinder/v2/' + PROJECT_ID + '/types/' + id,
      data: data
    });
  }

};
