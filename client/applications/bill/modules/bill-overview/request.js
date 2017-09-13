const fetch = require('../../cores/fetch');
const RSVP = require('rsvp');
const moment = require('client/libs/moment');
const GRANULARITY = {
  hour: 3600,
  day: 86400,
  month: 2592000
};

module.exports = {
  getServices: () => {
    let url = '/proxy/cloudkitty/v1/rating/module_config/hashmap/services';
    return fetch.get({
      url: url
    });
  },
  getPriceByService: (serviceName, startTime, endTime) => {
    let start = startTime ? moment(startTime).format().slice(0, 19) : '';
    let end = endTime ? moment(endTime).format().slice(0, 19) : '';
    let url = start && end ?
      `/proxy/gnocchi/v1/aggregation/resource/generic/metric/${serviceName}.cost?aggregation=sum&granularity=${GRANULARITY.day}&needed_overlap=0.0&refresh=False&start=${start}&end=${end}` :
      `/proxy/gnocchi/v1/aggregation/resource/generic/metric/${serviceName}.cost?aggregation=sum&granularity=${GRANULARITY.day}&needed_overlap=0.0&refresh=False`;
    return fetch.post({
      url: url,
      data: `{"and": [{">": {"started_at": "2015-01-01T00:00"}}], "=": {"project_id": ${HALO.user.projectId}}}`
    });
  },
  getTrend: () => {
    let queryList = [];
    let now = moment().format().slice(0, 19);
    let lastYear = moment().subtract(1, 'years').format().slice(0, 19);
    let lastMonth = moment().subtract(1, 'months').format().slice(0, 19);
    let urlByDay = `/proxy/gnocchi/v1/aggregation/resource/generic/metric/total.cost?aggregation=sum&granularity=${GRANULARITY.day}&needed_overlap=0.0&refresh=False&start=${lastMonth}&stop=${now}`;
    let urlByMonth = `/proxy/gnocchi/v1/aggregation/resource/generic/metric/total.cost?aggregation=sum&granularity=${GRANULARITY.month}&needed_overlap=0.0&refresh=False&start=${lastYear}&stop=${now}`;
    queryList[0] = fetch.post({
      url: urlByMonth,
      data: '{"and": [{">": {"started_at": "2015-01-01T00:00"}}]}'
    });
    queryList[1] = fetch.post({
      url: urlByDay,
      data: '{"and": [{">": {"started_at": "2015-01-01T00:00"}}]}'
    });
    return RSVP.all(queryList);
  },
  switchRegion: (regionId) => {
    let url = '/auth/switch_region';
    return fetch.put({
      url: url,
      data: {
        'region': regionId
      }
    });
  },
  switchProject: (projectId) => {
    let url = '/auth/switch_project';
    return fetch.put({
      url: url,
      data: {
        'projectId': projectId
      }
    });
  }
};
