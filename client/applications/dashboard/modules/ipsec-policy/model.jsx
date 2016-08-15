require('./style/index.less');

var React = require('react');
var Main = require('client/components/main/index');

var createPolicy = require('./pop/create/index');
var deleteModal = require('client/components/modal_delete/index');

var config = require('./config.json');
var request = require('./request');
var __ = require('locale/client/dashboard.lang.json');

class Model extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      config: config
    };

    ['onInitialize', 'onAction'].forEach((m) => {
      this[m] = this[m].bind(this);
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.style.display === 'none' && !nextState.config.table.loading) {
      return false;
    }
    return true;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.style.display !== 'none' && this.props.style.display === 'none') {
      if (this.state.config.table.loading) {
        this.loadingTable();
      } else {
        this.getTableData();
      }
    }
  }

  onInitialize(params) {
    this.getTableData();
  }

  getTableData() {
    request.getList().then((res) => {
      var table = this.state.config.table;
      table.data = res.ipsecpolicies;
      table.loading = false;

      this.setState({
        config: config
      });
    });
  }

  onAction(field, actionType, refs, data) {
    switch (field) {
      case 'btnList':
        this.onClickBtnList(data.key, refs, data);
        break;
      case 'table':
        this.onClickTable(actionType, refs, data);
        break;
      case 'detail':
        this.onClickDetailTabs(actionType, refs, data);
        break;
      default:
        break;
    }
  }

  onClickBtnList(key, refs, data) {
    var rows = data.rows;
    var that = this;
    switch (key) {
      case 'crt_policy':
        createPolicy(null, function(_data) {
          that.refresh(null, true);
        });
        break;
      case 'delete':
        deleteModal({
          __: __,
          action: 'delete',
          type: ['ipsec', 'policy'],
          iconType: 'redirect-policy',
          data: rows,
          onDelete: function(_data, cb) {
            request.deletePolicy(rows).then((res) => {
              cb(true);
              that.refresh(null, true);
            });
          }
        });
        break;
      case 'refresh':
        this.refresh({
          tableLoading: true,
          clearState: true
        }, true);
        break;
      default:
        break;
    }
  }

  onClickTable(actionType, refs, data) {
    switch (actionType) {
      case 'check':
        this.onClickTableCheckbox(refs, data);
        break;
      default:
        break;
    }
  }

  onClickTableCheckbox(refs, data) {
    var {rows} = data,
      btnList = refs.btnList,
      btns = btnList.state.btns;

    btnList.setState({
      btns: this.btnListRender(rows, btns)
    });
  }

  btnListRender(rows, btns) {
    for(let key in btns) {
      switch (key) {
        case 'delete':
          btns[key].disabled = rows.length > 0 ? false : true;
          break;
        default:
          break;
      }
    }

    return btns;
  }

  refresh(data, forceUpdate) {
    if (data) {
      if (data.tableLoading) {
        this.loadingTable();
      }
      if (data.clearState) {
        this.refs.dashboard.clearState();
      }
    }

    this.getTableData();
  }

  loadingTable() {
    var _config = this.state.config;
    _config.table.loading = true;

    this.setState({
      config: _config
    });
  }

  render() {
    return (
      <div className="halo-module-keypair" style={this.props.style}>
        <Main
          ref="dashboard"
          visible={this.props.style.display === 'none' ? false : true}
          onInitialize={this.onInitialize}
          onAction={this.onAction}
          config={this.state.config}
          params={this.props.params}
          __={__} />
      </div>
    );
  }

}

module.exports = Model;
