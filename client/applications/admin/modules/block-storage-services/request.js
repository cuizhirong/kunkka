const fetch = require('../../cores/fetch');

module.exports = {
  getList: function() {

    let url = '/proxy/cinder/v3/' + HALO.user.projectId + '/os-services';
    return fetch.get({
      url: url
    }).then((res) => {
      res._url = url;
      return res;
    });
  }
};
