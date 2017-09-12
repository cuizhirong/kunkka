const PendModel = require('../manage_ticket/model');
const request = require('../manage_ticket/request');
const config = require('./config.json');

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
    let tabs = _config.tabs;
    tabs[0].default = false;
    tabs[1].default = true;
    tabs[2].default = false;

    return _config;
  }

  getList() {
    this.stores.urls.length = 0;
    let table = this.state.config.table,
      pageLimit = table.limit;

    request.getList('proceeding', pageLimit).then((res) => {
      let _tickets = [];
      res.tickets.map((ticket) => {
        if (ticket.processor === HALO.user.userId) {
          _tickets.push(ticket);
        }
      });
      table.data = res.tickets;
      this.setPagination(table, res);
      this.updateTableData(table, res._url);
    });
  }
}

module.exports = Model;
