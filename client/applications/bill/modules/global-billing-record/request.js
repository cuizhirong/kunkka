const fetch = require('../../cores/fetch');
const download = require('client/utils/download');

module.exports = {
  getList: function(resourceType, projectId) {
    let url = `/proxy-shadowfiend/v1/orders/resource_consumption?resource_type=${resourceType}&limit=5`;
    if(projectId) {
      url += `&project_id=${projectId}`;
    } else {
      url += '&all_get=True';
    }
    return fetch.get({
      url: url
    });
  },
  getResourceList: function(projectId) {
    let url = '/proxy-shadowfiend/v1/orders/total_consumption';
    if(projectId) {
      url += `?project_id=${projectId}`;
    }
    return fetch.get({
      url: url
    });
  },
  getBillDetail: function(id) {
    const day = 24 * 60 * 60;
    const url = `/proxy/gnocchi/v1/metric/${id}/measures?aggregation=sum&granularity=${day}&refresh=False`;
    return fetch.get({
      url: url
    });
  },
  export: function(data) {
    let url = `/proxy-shadowfiend/v1/downloads/orders?output_format=${data.format}`;
    if(data.type === 'all_accounts') {
      url += '&all_get=True';
    } else if(data.type === 'specified_account') {
      url += `&user_id=${data.id}`;
    }
    if(data.startTime && data.endTime) {
      url += `&start_time=${data.startTime}&end_time=${data.endTime}`;
    }
    return download(url);
  },
  getProjectByName: function(name) {
    const url = `/proxy/keystone/v3/projects?name=${name}`;
    return fetch.get({
      url: url
    });
  }
};
