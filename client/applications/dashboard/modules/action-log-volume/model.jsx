const config = require('./config.json');
const request = require('./request');

const ActionModel = require('../action-log/model');

class Model extends ActionModel {

  constructor(props) {
    super(props);

    this.state = {
      config: config
    };
  }

  getTableData(forceUpdate, detailRefresh) {
    request.getEvents().then((res) => {
      let table = this.state.config.table;

      table.data = res;
      table.loading = false;

      let detail = this.refs.dashboard.refs.detail;
      if (detail && detail.state.loading) {
        detail.setState({
          loading: false
        });
      }

      this.setState({
        config: config
      }, () => {
        if (detail && detailRefresh) {
          detail.refresh();
        }
      });
    });
  }
}

module.exports = Model;
