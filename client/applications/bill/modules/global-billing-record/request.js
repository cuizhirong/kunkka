const fetch = require('../../cores/fetch');
const download = require('client/utils/download');

module.exports = {
  getList: function(resourceType, projectId, marker) {
    const pageLimit = localStorage.getItem('page_limit');
    let url = `/proxy-shadowfiend/v1/orders/bills?resource_type=${resourceType}&limit=${pageLimit}`;
    if(projectId) {
      url += `&project_id=${projectId}`;
    } else {
      url += '&all_get=True';
    }
    if(marker) {
      url += `&marker=${marker}`;
    }
    return fetch.get({
      url: url
    });
  },
  getResourceList: function(projectId) {
    let url = '/proxy-shadowfiend/v1/orders/summary';
    if(projectId) {
      url += `?project_id=${projectId}`;
    } else {
      url += '?all_get=True';
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
    if(data.type === 'all_projects') {
      url += '&all_get=True';
    } else if(data.type === 'specified_project') {
      url += `&project_id=${data.id}`;
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
