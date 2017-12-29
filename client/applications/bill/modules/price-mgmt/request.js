const fetch = require('../../cores/fetch');
const RSVP = require('rsvp');
const price = require('client/utils/price');

module.exports = {
  getList: price.getList,
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
