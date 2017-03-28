var fetch = require('client/applications/dashboard/cores/fetch');
// var RSVP = require('rsvp');
function getParams(obj) {
  var params = Object.keys(obj).map((key) => {
    return obj[key] ? key + '=' + obj[key] : '';
  }).join('&');

  return params;
}

module.exports = {
  getSales: function(offset = 0, limit = 10, data) {
    return fetch.get({
      url: '/proxy/gringotts/v2/orders?limit=' + limit + '&offset=' + offset + (Object.keys(data).length > 0 ? '&' + getParams(data) : '')
    }).then((res) => {
      res.orders.forEach((o) => {
        if(o.type === 'floatingip') {
          o.type = 'floating-ip';
        }
      });
      return res;
    });
  },
  getBillsByOrder: function(id, offset = 0, limit = 10) {
    return fetch.get({
      url: '/proxy/gringotts/v2/orders/' + id + '?limit=' + limit + '&offset=' + offset
    }).then((res) => {
      var data = res.bills;
      for (let i = 0; i < data.length; i++) {
        data[i]._id = i;
      }

      return res;
    });
  }
};
