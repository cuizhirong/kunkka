const ImageModel = require('../image/model');
const config = require('./config.json');
const request = require('../image/request');
const __ = require('locale/client/approval.lang.json');
const getStatusIcon = require('../../utils/status_icon');
const unitConverter = require('client/utils/unit_converter');

class Model extends ImageModel {

  constructor(props) {
    super(props);

    this.state = {
      config: config
    };
  }

  getTableData(forceUpdate, detailRefresh) {
    request.getList(forceUpdate).then((res) => {
      let _config = this.state.config;

      let table = config.table;
      let data = res.filter((ele) => {
        let ownerMatch = ele.visibility === 'private' ? ele.owner === HALO.user.projectId : true;
        return ele.image_type === 'snapshot' && ownerMatch;
      });
      table.data = data;
      table.loading = false;

      let detail = this.refs.dashboard.refs.detail;
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
    let name = this.getImageLabel(item);
    let size = unitConverter(item.size);

    let items = [{
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
