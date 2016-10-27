var ImageModel = require('../image/model');
var config = require('./config.json');
var request = require('../image/request');
var __ = require('locale/client/approval.lang.json');
var getStatusIcon = require('../../utils/status_icon');
var unitConverter = require('client/utils/unit_converter');

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

  getBasicPropsItems(item) {
    var name = this.getImageLabel(item);
    var size = unitConverter(item.size);

    var items = [{
      title: __.name,
      content: name
    }, {
      title: __.id,
      content: item.id
    }, {
      title: __.size,
      content: size.num + ' ' + size.unit
    }, {
      title: __.type,
      content: item.image_type === 'snapshot' ? __.instance_snapshot : __.image
    }, {
      title: __.checksum,
      content: item.checksum ? item.checksum : '-'
    }, {
      title: __.status,
      content: getStatusIcon(item.status)
    }, {
      title: __.create + __.time,
      type: 'time',
      content: item.created_at
    }, {
      title: __.update + __.time,
      type: 'time',
      content: item.updated_at
    }, {
      title: __.owner,
      content: item.meta_owner ? item.meta_owner : '-'
    }];

    return items;
  }

}

module.exports = Model;
