var fetch = require('../../cores/fetch');
var RSVP = require('rsvp');

const PROJECT_ID = HALO.user.projectId;

module.exports = {
  getList: function() {
    let url = '/proxy/cinder/v2/' + PROJECT_ID + '/qos-specs';
    return fetch.get({
      url: url
    }).then((res) => {
      res._url = url;
      return res;
    });
  },
  getSingle: function(id) {
    let url = '/proxy/cinder/v2/' + PROJECT_ID + '/qos-specs/' + id;
    return fetch.get({
      url: url
    }).then((res) => {
      res._url = url;
      return res;
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
  createQosSpec: function(data) {
    return fetch.post({
      url: '/proxy/cinder/v2/' + PROJECT_ID + '/qos-specs',
      data: data
    });
  },
  updateQosSpec: function(id, data) {
    return fetch.put({
      url: '/proxy/cinder/v2/' + PROJECT_ID + '/qos-specs/' + id,
      data: data
    });
  },
  deleteQosSpecs: function(ids) {
    let list = ids.map((id) => fetch.delete({
      url: '/proxy/cinder/v2/' + PROJECT_ID + '/qos-specs/' + id
    }));

    return RSVP.all(list);
  },
  deleteKeys: function(id, data) {
    return fetch.put({
      url: '/proxy/cinder/v2/' + PROJECT_ID + '/qos-specs/' + id + '/delete_keys',
      data: data
    });
  },
  updateKeys: function({ id, updateData, deleteData }) {
    let list = [];
    if (Object.keys(updateData.qos_specs).length > 0) {
      list.push(this.updateQosSpec(id, updateData));
    }
    if (deleteData.keys.length > 0) {
      list.push(this.deleteKeys(id, deleteData));
    }

    return RSVP.all(list);
  }
};
