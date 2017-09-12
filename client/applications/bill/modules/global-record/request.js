const fetch = require('../../cores/fetch');

module.exports = {
  getList: function(offset, pageLimit) {
    if (isNaN(Number(pageLimit))) {
      pageLimit = 10;
    }
    if (isNaN(Number(offset))) {
      offset = 0;
    }

    let url = '/proxy/gringotts/v2/accounts/charges?limit=' + pageLimit + '&offset=' + offset;
    return fetch.get({
      url: url
    }).then((res) => {
      res._url = url;
      return res;
    }).catch((res) => {
      res._url = url;
      return res;
    });
  }
};
