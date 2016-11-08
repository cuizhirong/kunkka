var React = require('react');
var Main = require('./index');
var router = require('client/utils/router');

class Module extends React.Component {

  constructor(props) {
    super(props);

    //hook
    this.className = '';
    this.lang = {};
    this.getStatusIcon = () => {};

    this.refreshForce = this.refreshForce.bind(this);
    this.onAction = this.onAction.bind(this);
    this.onInitialize = this.onInitialize.bind(this);
  }

  componentWillMount() {
    this.tableColRender && this.tableColRender();
    this.msgListener && this.msgListener();
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
        this.getTableData(false);
      }
    }
  }

  onInitialize(params) {
    this.getTableData(false);
  }

  getTableData(forceUpdate, detailRefresh) {
    this.getList(forceUpdate).then((data) => {
      var _config = this.state.config;

      var table = _config.table;
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

  refreshForce() {
    this.refresh(null, true);
  }

  refresh(data, forceUpdate) {
    let path = router.getPathList();
    if (data) {
      if (path[2]) {
        if (data.detailLoading) {
          this.refs.dashboard.refs.detail.loading();
        }
      } else {
        if (data.tableLoading) {
          this.loadingTable();
        }
        if (data.clearState) {
          this.refs.dashboard.clearState();
        }
      }
    }

    this.getTableData(forceUpdate, path[2] ? true : false);
  }

  loadingTable() {
    var _config = this.state.config;
    _config.table.loading = true;

    this.setState({
      config: _config
    });
  }

  onAction(field, actionType, refs, data) {
    switch (field) {
      case 'btnList':
        if (data.key === 'refresh') {
          this.refresh({
            tableLoading: true,
            detailLoading: true,
            clearState: true,
            detailRefresh: true
          }, true);
        } else {
          this.onClickBtnList(data.key, refs, data);
        }
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

  onClickBtnList() {}

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

  render() {
    var props = this.props;

    return (
      <div className={'halo-module' + this.className} style={props.style}>
        <Main
          ref="dashboard"
          visible={props.style.display === 'none' ? false : true}
          onInitialize={this.onInitialize}
          onAction={this.onAction}
          onClickDetailTabs={this.onClickDetailTabs}
          config={this.state.config}
          params={props.params}
          getStatusIcon={this.getStatusIcon}
          __={this.lang} />
      </div>
    );
  }

}

module.exports = Module;
