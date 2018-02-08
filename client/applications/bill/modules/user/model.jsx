require('./style/index.less');

const React = require('react');
const Main = require('client/components/main_paged/index');
const charge = require('./pop/charge/index');
const {Notification} = require('uskin');

const request = require('./request');
const config = require('./config.json');
const __ = require('locale/client/bill.lang.json');

class Model extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      config: config
    };

    ['onInitialize', 'onAction'].forEach((m) => {
      this[m] = this[m].bind(this);
    });
    // pagination
    this.stores = {
      urls: []
    };
  }

  componentWillMount() {
    this.tableColRender(this.state.config.table.column);
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
      this.onInitialize();
    }
  }

  tableColRender(columns) {
    columns.map((column) => {
      switch (column.key) {
        case 'balance':
          column.render = (col, item, i) => {
            return item.balance ? <span className="orange">{item.balance}</span> : '-';
          };
          break;
        default:
          break;
      }
    });
  }

  onInitialize() {
    this.loadingTable();
    this.getList();
  }

  getList() {
    this.clearState();

    let table = this.state.config.table;
    request.getList().then((res) => {
      table.data = res.list;
      this.setPagination(table, res);
      this.updateTableData(table, res._url);
    }).catch((err) => {
      table.data = [];
      table.pagination = null;
      this.updateTableData(table);
    });
  }

  getNextListData(url, refreshDetail) {
    let table = this.state.config.table;
    request.getNextList(url).then((res) => {
      if (res.list) {
        table.data = res.list;
      } else {
        table.data = [];
      }
      this.setPagination(table, res);
      this.updateTableData(table, res._url, refreshDetail);
    }).catch((res) => {
      table.data = [];
      table.pagination = null;
      this.updateTableData(table, res._url);
    });
  }

  getListById(id) {
    this.clearState();

    let table = this.state.config.table;
    request.getListById(id).then(res => {
      table.data = res.list;
      this.setPagination(table, res);
      this.updateTableData(table);
    });
  }

  getListByName(name) {
    this.clearState();

    let table = this.state.config.table;
    request.getListByName(name).then(res => {
      table.data = res.list;
      this.setPagination(table, res);
      this.updateTableData(table, res._url);
    });
  }

  setPagination(table, res) {
    let pagination = {};

    if(res.links && res.links.next) {
      pagination.nextUrl = res.links.next;
    }
    if(res.links && res.links.prev) {
      pagination.prevUrl = res.links.prev;
    }

    table.pagination = pagination;

    return table;
  }

  updateTableData(table, currentUrl, refreshDetail, callback) {
    let newConfig = this.state.config;
    newConfig.table = table;
    newConfig.table.loading = false;

    this.setState({
      config: newConfig
    }, () => {
      if (currentUrl) {
        this.stores.urls.push(currentUrl);

        let detail = this.refs.dashboard.refs.detail,
          params = this.props.params;
        if (detail && refreshDetail && params.length > 2) {
          detail.refresh();
        }
        callback && callback();
      }
    });
  }

  onFilterSearch(actionType, refs, data) {
    this.clearState();
    if (actionType === 'search') {
      this.loadingTable();

      let name = data.name;
      let id = data.id;

      if (id) {
        this.getListById(id.id);
      } else if(name) {
        this.getListByName(name.name);
      } else {
        this.getList();
      }
    }
  }

  refresh() {
    this.clearState();
    this.loadingTable();
    this.getList();
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

  onAction(field, actionType, refs, data) {
    switch (field) {
      case 'btnList':
        this.onClickBtnList(data.key, refs, data);
        break;
      case 'filter':
        this.onFilterSearch(actionType, refs, data);
        break;
      case 'table':
        this.onClickTable(actionType, refs, data);
        break;
      case 'page_limit':
        this.onInitialize();
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
      case 'pagination':
        let url,
          history = this.stores.urls;

        if (data.direction === 'prev'){
          history.pop();
          if (history.length > 0) {
            url = history.pop();
          }
        } else if (data.direction === 'next') {
          url = data.url;
        } else {//default
          url = this.stores.urls[0];
          this.clearState();
        }

        this.loadingTable();
        this.getNextListData(url);
        break;
      default:
        break;
    }
  }

  onClickBtnList(key, refs, data) {
    let {rows} = data;

    let that = this;
    switch(key) {
      case 'charge':
        charge(rows[0], null, function(d, user) {
          Notification.addNotice({
            showIcon: true,
            icon: 'icon-status-active',
            content: __.charge_success.replace('{0}', user).replace('{1}', d.value),
            isAutoHide: true,
            type: 'info',
            width: 300
          });
          that.refresh();
        });
        break;
      case 'refresh':
        this.refresh();
        break;
      default:
        break;
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

  btnListRender(rows, btns) {
    btns.charge.disabled = !(rows.length === 1 && rows[0] && rows[0].balance);

    return btns;
  }

  render() {
    return (
      <div className="halo-module-user" style={this.props.style}>
        <Main
          ref="dashboard"
          visible={this.props.style.display === 'none' ? false : true}
          onInitialize={this.onInitialize}
          onAction={this.onAction}
          __={__}
          config={this.state.config}
          params={this.props.params}
        />
      </div>
    );
  }
}

module.exports = Model;
