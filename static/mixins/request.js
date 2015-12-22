var Promise = require('rsvp').Promise;

var request = {

  get(obj) {
    return this.ajax({
      method: 'GET',
      url: obj.url,
      query: obj.query
    });
  },

  getJSON(obj) {
    return this.ajax({
      method: 'GET',
      url: obj.url,
      responseType: 'JSON'
    });
  },

  put(obj) {
    return this.ajax({
      method: 'PUT',
      url: obj.url,
      data: obj.data
    });
  },

  post(obj) {
    return this.ajax({
      method: 'POST',
      url: obj.url,
      data: obj.data
    });
  },

  delete(obj) {
    return this.ajax({
      method: 'DELETE',
      url: obj.url
    });
  },

  ajax(options) {
    var opt = options;

    var promise = new Promise(function(resolve, reject) {
      function handler() {
        if (this.readyState !== 4) {
          return;
        }
        if (this.status === 200) {
          resolve(this.response);
        } else {
          reject(new Error(this.statusText));
        }
      }

      var xhr = new XMLHttpRequest();
      xhr.open(opt.method, opt.url);
      xhr.onreadystatechange = handler;
      xhr.responseType = opt.responseType || 'JSON';
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(JSON.stringify(opt.data));
    });

    return promise;
  },

  _decodeQuery(obj) {
    Object.keys(obj).map((el) => {
      return el + '=' + obj[el];
    });
  }

};

module.exports = request;
