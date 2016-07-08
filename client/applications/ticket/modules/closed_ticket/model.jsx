var PendModel = require('../manage_ticket/model');
var __ = require('locale/client/ticket.lang.json');
var request = require('../manage_ticket/request');

class Model extends PendModel {

  constructor(props) {
    super(props);

    var config = this.state.config;

    this.state = {
      config: this.setConfig(config)
    };

    this.stores = {
      urls: []
    };
  }

  setConfig(config) {
    var tabs = config.tabs;
    tabs[0].default = false;
    tabs[1].default = false;
    tabs[2].default = true;

    config.btns.splice(0, 2, {
      value: __.update_to + __.pending,
      key: 'pending',
      icon: 'refresh',
      disabled: false
    }, {
      value: __.update_to + __.proceeding,
      key: 'proceeding',
      icon: 'refresh',
      disabled: false
    });
    return config;
  }

  getList() {
    this.stores.urls.length = 0;
    var table = this.state.config.table,
      pageLimit = table.limit;

    request.getList('closed', pageLimit).then((res) => {
      table.data = res.tickets;
      this.setPagination(table, res);
      this.updateTableData(table, res._url);
    });
  }
}

module.exports = Model;
