const fetch = require('../../cores/fetch');

module.exports = {
  getList: function(pageLimit) {
    let url = '/api/v1/services';
    return fetch.get({
      url: url
    }).then((res) => {
      res._url = url;
      return res;
    });
  }
};
