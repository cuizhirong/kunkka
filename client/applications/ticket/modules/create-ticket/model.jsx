require('./style/index.less');

var React = require('react');
var Main = require('client/components/main_paged/index');

var createTickets = require('./pop/create_tickets/index');
var config = require('./config.json');
var request = require('./request');
var moment = require('client/libs/moment');
var __ = require('locale/client/ticket.lang.json');

class Model extends React.Component {

  constructor(props) {
    super(props);

    moment.locale(HALO.configs.lang);

    this.state = {
      config: config
    };

    ['onInitialize', 'onAction'].forEach((m) => {
      this[m] = this[m].bind(this);
    });

    this.stores = {
      urls: []
    };
  }

  componentWillMount() {
    var column = this.state.config.table.column;
    this.tableColRender(column);
  }

  tableColRender(columns) {
    columns.map((column) => {
    });
  }

  //initialize table data
  onInitialize(params) {
    if (params[2]) {
      this.getSingle(params[2]);
    } else {
      this.getList();
    }
  }

  //request: get single data by ID
  getSingle(id) {
    var table = this.state.config.table;
    request.getSingle(id).then((res) => {
      table.data = [res];

    }).catch((res) => {
      table.data = [];

    });
  }

  //request: get list
  getList() {
    var table = this.state.config.table,
      pageLimit = table.limit;

    request.getList(pageLimit).then((res) => {
      table.data = res.tickets;
      this.setPagination(table, res);
      this.updateTableData(table, res._url);
    });
  }

  getNextList(url, refreshDetail) {
    request.getNextList(url).then((res) => {
      var table = this.state.config.table;
      if (res.images) {
        table.data = res.images;
      } else if (res.id) {
        table.data = [res];
      } else {
        table.data = [];
      }

      this.setPagination(table, res);
      this.updateTableData(table, res._url, refreshDetail);
    });
  }

  updateTableData(table, currentUrl, refreshDetail, callback) {
    var newConfig = this.state.config;
    newConfig.table = table;
    newConfig.table.loading = false;

    this.setState({
      config: newConfig
    }, () => {
      this.stores.urls.push(currentUrl.split('')[1]);

      var detail = this.refs.dashboard.refs.detail,
        params = this.props.params;
      if(detail && refreshDetail && params.length > 2) {
        detail.refresh();
      }

      callback && callback();
    });
  }

  setPagination(table, res) {
    var pagination = {},
      next = res.next ? res.next : null;

    if (next) {
      pagination.nextUrl = next.split('')[1];
    }

    var history = this.stores.urls;

    if(history.length > 0) {
      pagination.prevUrl = history[history.length - 1];
    }
    table.pagination = pagination;

    return table;
  }

  getInitialListData() {
    this.getList();
  }

  getNextListData(url, refreshDetail) {
    this.getNextList(url, refreshDetail);
  }

  refresh(data, params) {
    if (!data) {
      data = {};
    }
    if (!params) {
      params = this.props.params;
    }

    if (data.initialList) {
      if (data.loadingTable) {
        this.loadingTable();
      }
      if(data.clearState) {
        this.clearState();
      }

      this.getInitialListData();
    } else if (data.refreshList) {
      if (params[2]) {
        if (data.loadingDetail) {
          this.loadingDetail();
        }
      } else {
        if (data.loadingTable) {
          this.loadingTable();
        }
      }

      var history = this.stores.urls,
        url = history.pop();

      this.getNextListData(url, data.refreshDetail);
    }
  }

  loadingTable() {
    var _config = this.state.config;
    _config.table.loading = true;
    _config.table.data = [];

    this.setState({
      config: _config
    });
  }

  loadingDetail() {
    this.refs.dashboard.refs.detail.loading();
  }

  clearUrls() {
    this.stores.urls.length = 0;
  }

  clearState() {
    this.clearUrls();

    var dashboard = this.refs.dashboard;
    if (dashboard) {
      dashboard.clearState();
    }
  }

  onAction(field, actionType, refs, data) {
    switch(field) {
      case 'btnList':
        this.onClickBtnList(data.key, refs, data);
        break;
      case 'table':
        this.onClickTable(actionType, refs, data);
        break;
      default:
        break;
    }
  }

  onClickTable(actionType, refs, data) {
    console.log(actionType);
  }

  onClickBtnList(key, refs, data) {
    switch(key) {
      case 'create':
        createTickets();
        break;
      case 'open':
        console.log('open');
        break;
      case 'close':
        console.log('close');
        break;
      case 'refresh':
        this.refresh({
          refreshList: true,
          refreshDetail: true,
          loadingTable: true,
          loadingDetail: true
        });
        break;
      default:
        break;
    }
  }

  render() {
    return (
      <div className="halo-module-create-tickets"
      style={this.props.style}>
        <Main
          ref="dashboard"
          visible={this.props.style.display ===
          'none' ? false : true}
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
