var ImageModel = require('../image/model');
var __ = require('locale/client/dashboard.lang.json');
var request = require('../image/request');

class Model extends ImageModel {

  constructor(props) {
    super(props);

    var config = this.state.config;
    this.setConfig(config);

    this.state = {
      config: config
    };
  }

  setConfig(config) {
    var tabs = config.tabs;
    tabs[0].default = false;
    tabs[1].default = true;

    var hasDelete = config.btns.some((ele) => ele.key === 'delete');
    if (!hasDelete) {
      config.btns.splice(1, 0, {
        value: __.delete,
        key: 'delete',
        type: 'delete',
        icon: 'delete',
        disabled: true
      });
    }

    return config;
  }

  getTableData(forceUpdate, detailRefresh) {
    request.getList(forceUpdate).then((res) => {
      var config = this.state.config;
      this.setConfig(config);

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
