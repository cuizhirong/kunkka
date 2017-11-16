const fetch = require('client/applications/dashboard/cores/fetch');
let RSVP = require('rsvp');

module.exports = {
  getResourceList: function(offset, pageLimit) {
    let limit = pageLimit ? pageLimit : 10;
    let url = `/proxy/gnocchi/v1/rating_resource?name=total.cost&limit=${limit}&offset=${offset}&project_id=${HALO.user.projectId}`;
    return fetch.get({
      url: url
    });
  },
  getList: function(offset, pageLimit) {
    let total = 0;
    let list = [];
    return this.getResourceList(offset, pageLimit).then(res => {
      let queryList = [];
      list = res[1];
      total = res[0];
      res[1].forEach(r => {
        queryList.push(fetch.get({
          url: '/proxy/gnocchi/v1/metric/' + r.id + '/measures?granularity=2592000&aggregation=sum&refresh=False'
        }));
      });
      return RSVP.all(queryList);
    }).then(res => {
      list.forEach((l, i) => {
        l.resources = res[i];

        l.cost = res[i].reduce((prev, next) => prev + next[2], 0).toFixed(2);
      });
      return {
        total: total,
        data: list
      };
    });
  }
};
