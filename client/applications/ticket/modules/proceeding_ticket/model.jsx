var PendModel = require('../manage_ticket/model');
var request = require('../manage_ticket/request');
var config = require('./config.json');

class Model extends PendModel {

  constructor(props) {
    super(props);

    this.state = {
      config: this.setConfig(config)
    };

    this.stores = {
      urls: []
    };
  }

  setConfig(_config) {
    var tabs = _config.tabs;
    tabs[0].default = false;
    tabs[1].default = true;
    tabs[2].default = false;

    return _config;
  }

  getList() {
    this.stores.urls.length = 0;
    var table = this.state.config.table,
      pageLimit = table.limit;

    request.getList('proceeding', pageLimit).then((res) => {
      var _tickets = [];
      res.tickets.map((ticket) => {
        if (ticket.processor === HALO.user.userId) {
          _tickets.push(ticket);
        }
      });
      table.data = _tickets;
      this.setPagination(table, res);
      this.updateTableData(table, res._url);
    });
  }
}

module.exports = Model;
