var fetch = require('../../cores/fetch');
var RSVP = require('rsvp');

module.exports = {
  getOverview: function() {
    var queryList = [];
    queryList.push(this.getBill());
    queryList.push(this.getBillProject());
    return RSVP.all(queryList);
  },
  getBill: function() {
    return fetch.get({
      url: '/proxy/gringotts/v2/accounts/detail?user_id=' + HALO.user.userId
    });
  },
  getBillProject: function() {
    return fetch.get({
      url: '/proxy/gringotts/v2/projects?user_id=' + HALO.user.userId
    });
  }
};
