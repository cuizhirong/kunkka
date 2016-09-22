var fetch = require('../../cores/fetch');
var RSVP = require('rsvp');

module.exports = {
  getList: function() {
    var url = '/proxy/gringotts/v2/products/detail';
    return fetch.get({
      url: url
    }).then((res) => {
      var productsArray = [];
      for (var k in res.products) {
        productsArray = productsArray.concat(res.products[k]);
        res.products[k].id = res.products[k].product_id;
      }
      res._url = url;
      res.products = productsArray;
      return res;
    });
  },
  getPriceById: function(id) {
    var url = '/proxy/gringotts/v2/products/' + id;
    return fetch.get({
      url: url
    }).then((res) => {
      res.id = res.product_id;
      res._url = url;
      return res;
    });
  },
  getPriceByName: function(name) {
    var url = '/proxy/gringotts/v2/products/detail';
    return fetch.get({
      url: url
    }).then((res) => {
      for(var k in res.products) {
        if(res.products[k].name === name) {
          res.products[k].id = res.products[k].product_id;
          return res.products[k];
        }
      }
      return '';
    });
  },
  updatePriceById: function(id, data) {
    var url = '/proxy/gringotts/v2/products/' + id;
    return fetch.put({
      url: url,
      data: data
    });
  },
  deleteItem: function(items) {
    var deferredList = [];
    items.forEach((item) => {
      deferredList.push(fetch.delete({
        url: '/proxy/gringotts/v2/products/' + item.id
      }));
    });
    return RSVP.all(deferredList);
  },
  addPrice: function (data) {
    return fetch.post({
      url: '/proxy/gringotts/v2/products/',
      data: data
    });
  }
};
