const React = require('react');
const Main = require('./index');
const router = require('client/utils/router');
const moment = require('client/libs/moment');

class Model extends React.Component {

  constructor(props) {
    super(props);

    moment.locale(HALO.configs.lang);

    this.stores = {
      urls: []
    };

    //hook
    this.className = '';
    this.lang = {};
    this.getStatusIcon = () => {};

    this.defaultRefresh = this.defaultRefresh.bind(this);
    this.onAction = this.onAction.bind(this);
    this.onInitialize = this.onInitialize.bind(this);
  }

  componentWillMount() {
    this.tableColRender && this.tableColRender();
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.style.display === 'none' && this.props.style.display === 'none') {
      return false;
    }
    return true;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.style.display !== 'none' && this.props.style.display === 'none') {
      this.loadingTable();
      this.onInitialize(nextProps.params);
    }
  }

  onInitialize(params) {
    if (params) {
      if (params[2]) {
        this.getSingle(params[2]);
      } else {
        this.getList();
      }
    } else {
      this.getList();
    }
  }

  updateTableData(table, currentUrl, refreshDetail) {
    let newConfig = this.state.config;
    newConfig.table = table;
    newConfig.table.loading = false;

    this.setState({
      config: newConfig
    }, () => {
      this.stores.urls.push(currentUrl);
      let dashboard = this.refs.dashboard,
        detail = dashboard.refs.detail,
        params = this.props.params;

      if (detail && refreshDetail && params.length > 2) {
        detail.refresh();
      }
    });
  }

  setPaginationData(table, res) {
    let pagination = {},
      next = res.links && res.links.next ? res.links.next : null;

    if (next) {
      pagination.nextUrl = next;
    }

    let history = this.stores.urls;

    if (history.length > 0) {
      pagination.prevUrl = history[history.length - 1];
    }
    table.pagination = pagination;

    return table;
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

    let history = this.stores.urls,
      url = history.pop();
    this.getNextListData(url, true);
  }

  loadingTable() {
    let _config = this.state.config;
    _config.table.loading = true;

    this.setState({
      config: _config
    });
  }

  loadingDetail() {
    this.refs.dashboard.refs.detail.loading();
  }

  clearUrls() {
    this.stores.urls = [];
  }

  clearState() {
    this.clearUrls();

    let dashboard = this.refs.dashboard;
    if (dashboard) {
      dashboard.clearState();
    }
  }

  onClickTableCheckbox(refs, data) {
    let {rows} = data,
      btnList = refs.btnList,
      btns = btnList.state.btns;

    btnList.setState({
      btns: this.btnListRender(rows, btns)
    });
  }

  defaultRefresh() {
    this.refresh(null, true);
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
      case 'search':
        this.onClickSearch(actionType, refs, data);
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

  onClickSearch(actionType, refs, data) {
    if (actionType === 'click') {
      this.loadingTable();
      if (data.text) {
        this.getSingle(data.text);
      } else {
        this.getList();
      }
    }
  }

  render() {
    let props = this.props;

    return (
      <div className={'halo-module-default ' + this.className} style={props.style}>
        <Main
          ref="dashboard"
          visible={props.style.display === 'none' ? false : true}
          onInitialize={this.onInitialize}
          onAction={this.onAction}
          onClickDetailTabs={this.onClickDetailTabs}
          config={this.state.config}
          params={props.params}
          getStatusIcon={this.getStatusIcon}
          __={this.lang}
        />
      </div>
    );
  }

}

module.exports = Model;
