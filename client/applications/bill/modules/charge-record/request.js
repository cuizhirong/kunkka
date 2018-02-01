const fetch = require('../../cores/fetch');
const download = require('client/utils/download');

module.exports = {
  getList: function(offset) {
    const pageLimit = localStorage.getItem('page_limit');
    const pageOffset = offset || 0;
    let url = '/proxy/shadowfiend/v1/accounts/' + HALO.user.userId + '/charges?offset=' + pageOffset + '&limit=' + pageLimit;
    return fetch.get({
      url: url
    });
  },
  export: function(data) {
    let url = `/proxy-shadowfiend/v1/downloads/charges?output_format=${data.format}&user_id=${data.id}`;
    if(data.startTime && data.endTime) {
      url += `&start_time=${data.startTime}&end_time=${data.endTime}`;
    }
    return download(url);
  }
};
