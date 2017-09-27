const fetch = require('../../cores/fetch');

module.exports = {
  getList: function() {

    let url = '/proxy/nova/v2.1/' + HALO.user.projectId + '/os-services';
    return fetch.get({
      url: url
    }).then((res) => {
      res._url = url;
      return res;
    });
  }
};
