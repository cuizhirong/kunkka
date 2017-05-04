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
      var domainID = 'default';
      if (HALO.configs.domain) {
        let domainName = HALO.configs.domain.toLowerCase();
        let domainIndex = domains.findIndex((ele) => ele.name.toLowerCase() === domainName);

        if (domainIndex > -1) {
          domainID = domains[domainIndex].id;

          domains.unshift(domains[domainIndex]);
          domains.splice(domainIndex + 1, 1);
        }
      }

      var url = '/api/v1/users?limit=' + pageLimit;
      if (HALO.settings.enable_ldap) {
        url += '&domain_id=' + domainID;
      }

      return fetch.get({
        url: url
      }).then((users) => {
        users._url = url;
        return this.getCharge().then((charges) => {
          users.users.map((user) => {
            charges.accounts.map((account) => {
              if (account.user_id === user.id) {
                user.balance = account.balance;
                return true;
              }
              return false;
            });
            return [users, domains];
          });
          return [users, domains];
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
