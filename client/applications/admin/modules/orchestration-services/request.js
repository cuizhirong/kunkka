const fetch = require('../../cores/fetch');

module.exports = {
  getList: function() {

    let url = '/proxy/heat/v1/' + HALO.user.projectId + '/services';

    return fetch.get({
      url: url
    }).then((res) => {
      res._url = url;
      return res;
    });
  }
};
