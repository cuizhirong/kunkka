var fetch = require('../../cores/fetch');

function requestParams(obj) {
  var str = '';
  for(let key in obj) {
    str += ('&' + key + '=' + obj[key]);
  }

  return str;
}

module.exports = {
  getList: function(pageLimit) {
    if(isNaN(Number(pageLimit))) {
      pageLimit = 10;
    }

    return this.getDomains().then((domains) => {
      var currentDomain = HALO.configs.domain.toLowerCase();
      var defaultid = HALO.settings.enable_ldap ? '&domain_id=default' : '';
      var domainID = domains.find((ele) => ele.name.toLowerCase() === currentDomain).id;
      var urlParam = domainID !== 'default' ? '&domain_id=' + domainID : defaultid;

      var url = '/api/v1/users?limit=' + pageLimit + urlParam;
      return fetch.get({
        url: url
      }).then((res) => {
        res._url = url;
        return this.getCharge().then((charges) => {
          res.users.map((user) => {
            charges.accounts.map((account) => {
              if (account.user_id === user.id) {
                user.balance = account.balance;
                return true;
              }
              return false;
            });
            return res;
          });
          return res;
        });
      });
    });
  },
  getFilteredList: function(data, pageLimit) {
    if(isNaN(Number(pageLimit))) {
      pageLimit = 10;
    }

    var url = '/api/v1/users?limit=' + pageLimit + requestParams(data);
    return fetch.get({
      url: url
    }).then((res) => {
      res._url = url;
      return this.getCharge().then((charges) => {
        res.users.map((user) => {
          charges.accounts.map((account) => {
            if (account.user_id === user.id) {
              user.balance = account.balance;
              return true;
            }
            return false;
          });
          return res;
        });
        return res;
      });
    });
  },
  getNextList: function(nextUrl) {
    return fetch.get({
      url: nextUrl
    }).then((res) => {
      res._url = nextUrl;
      return this.getCharge().then((charges) => {
        res.users.map((user) => {
          charges.accounts.map((account) => {
            if (account.user_id === user.id) {
              user.balance = account.balance;
              return true;
            }
            return false;
          });
          return res;
        });
        return res;
      });
    }).catch((res) => {
      res._url = nextUrl;
      return res;
    });
  },
  getDomains: function() {
    return fetch.get({
      url: '/proxy/keystone/v3/domains'
    }).then((res) => {
      var domains = [];
      res.domains.forEach((domain) => {
        if (domain.id === 'default') {
          domains.unshift(domain);
        } else {
          domains.push(domain);
        }
      });

      return domains;
    });
  },
  charge: function(id, data) {
    return fetch.put({
      url: '/proxy/gringotts/v2/accounts/' + id,
      data: data
    });
  },
  getChargeById: function(id) {
    return fetch.get({
      url: '/proxy/gringotts/v2/accounts/' + id
    });
  },
  getCharge: function() {
    return fetch.get({
      url: '/proxy/gringotts/v2/accounts/'
    });
  }
};
