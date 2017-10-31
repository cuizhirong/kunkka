const fetch = require('../../cores/fetch');

module.exports = {
  getList: function() {
    let url = '/api/setting';
    return fetch.get({
      url: url
    }).then((res) => {
      let settingArray = [];
      for (let k in res.setting) {
        settingArray = settingArray.concat(res.setting[k]);
      }
      res._url = url;
      res.setting = settingArray;
      return res;
    });
  },
  editConfig: function(id, data) {
    return fetch.put({
      url: '/api/setting/id/' + id,
      data: data
    });
  }
};
