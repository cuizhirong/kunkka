const fetch = require('../../cores/fetch');

module.exports = {
  getList: function() {
    const pageLimit = localStorage.getItem('page_limit') || 10;
    return this.getDomains().then((domains) => {
      let currentDomain = HALO.configs.domain.toLowerCase();
      let defaultid = HALO.settings.enable_ldap ? '&domain_id=default' : '';
      let domainID = domains.find((ele) => ele.name.toLowerCase() === currentDomain).id;
      let urlParam = domainID !== 'default' ? '&domain_id=' + domainID : defaultid;

      let url = '/proxy-search/keystone/v3/users?user_type=person&limit=' + pageLimit + urlParam;
      return fetch.get({
        url: url
      }).then((users) => {
        users._url = url;
        return this.getCharge().then((charges) => {
          users.list.map((user) => {
            charges.accounts.map((account) => {
              if (account.user_id === user.id) {
                user.balance = account.balance;
                return true;
              }
              return false;
            });
            return users;
          });
          return users;
        });
      });
    });
  },
  getDomains: function() {
    return fetch.get({
      url: '/proxy/keystone/v3/domains'
    }).then((res) => {
      let domains = [];
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
  getCharge: function() {
    const url = '/proxy/shadowfiend/v1/accounts';
    return fetch.get({
      url: url
    });
  },
  getNextList: function(nextUrl) {
    return fetch.get({
      url: nextUrl
    }).then((res) => {
      res._url = nextUrl;
      return this.getCharge().then((charges) => {
        res.list.map((user) => {
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
  getListById: function(userID) {
    let url = '/proxy-search/keystone/v3/users?user_type=person&id=' + userID;
    return fetch.get({
      url: url
    }).then((res) => {
      res._url = url;
      return this.getCharge().then((charges) => {
        res.list.map((user) => {
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
      res._url = url;
      return res;
    });
  },
  getListByName: function(name) {
    // shadowfiend中只存了id，所以需要通过name去找id，然后再通过id去找账户
    let url = '/proxy-search/keystone/v3/users?user_type=person&name=' + name;
    return fetch.get({
      url: url
    }).then(res => {
      res._url = url;
      return this.getCharge().then((charges) => {
        res.list.map((user) => {
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
      res._url = url;
      return res;
    });
  },
  charge: function(id, data) {
    return fetch.put({
      url: '/proxy/shadowfiend/v1/accounts/' + id,
      data: data
    });
  }
};
