const fetch = require('../../cores/fetch');
const download = require('client/utils/download');

module.exports = {
  getList: function(offset, pageLimit) {
    let url = '/proxy/shadowfiend/v1/accounts/charges?offset=' + offset + '&limit=' + pageLimit;
    return fetch.get({
      url: url
    });
  },
  export: function(data) {
    let url = `/proxy-shadowfiend/v1/downloads/charges?output_format=${data.format}`;
    if(data.type === 'all_accounts') {
      url += '&all_get=True';
    } else if(data.type === 'specified_account') {
      url += `&user_id=${data.id}`;
    }
    if(data.startTime && data.endTime) {
      url += `&start_time=${data.startTime}&end_time=${data.endTime}`;
    }
    return download(url);
  }
};
