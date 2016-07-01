var ImageModel = require('../image/model');
var config = require('./config.json');
var request = require('../image/request');

class Model extends ImageModel {

  constructor(props) {
    super(props);

    this.state = {
      config: config
    };
  }

  getTableData(forceUpdate, detailRefresh) {
    request.getList(forceUpdate).then((res) => {
      var _config = this.state.config;

      var table = config.table;
      var data = res.filter((ele) => ele.visibility === 'private');
      table.data = data;
      table.loading = false;

      var detail = this.refs.dashboard.refs.detail;
      if (detail && detail.state.loading) {
        detail.setState({
          loading: false
        });
      }

      this.setState({
        config: _config
      }, () => {
        if (detail && detailRefresh) {
          detail.refresh();
        }
      });
    });
  }

}

module.exports = Model;
