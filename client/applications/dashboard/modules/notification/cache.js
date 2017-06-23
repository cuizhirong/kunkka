var fetch = require('client/applications/dashboard/cores/fetch');
var RSVP = require('rsvp');

module.exports = {
  getNotificationList: function() {
    let names = [];
    let descriptions = [];
    return fetch.get({
      url: '/proxy/zaqar/v2/queues?detailed=true',
      headers: {
        'Client-ID': HALO.user.userId
      }
    }).then(function(data) {
      let queuesList = [];
      data.queues.forEach((q) => {
        names.push(q.name);
        descriptions.push(q.metadata.description ? q.metadata.description : '');
        queuesList.push(fetch.get({
          url: '/proxy/zaqar/v2/queues/' + q.name + '/subscriptions',
          headers: {
            'Client-ID': HALO.user.userId
          }
        }));
      });
      return RSVP.all(queuesList);
    }).then((queues) => {
      let rets = [];
      queues.forEach((q, i) => {
        let totalCount = q.subscriptions.length;
        let vertifyCount = q.subscriptions.filter(s => s.confirmed === true).length;
        q.total_count = totalCount;
        q.verified_count = vertifyCount;
        q.name = names[i];
        q.description = descriptions[i];
        rets.push(q);
      });
      return rets;
    });
  }
};
