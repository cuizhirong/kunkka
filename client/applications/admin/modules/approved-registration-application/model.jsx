require('./style/index.less');

const React = require('react');
const Main = require('client/components/main_paged/index');

const config = require('./config.json');
const __ = require('locale/client/admin.lang.json');
const request = require('./request');
const getStatusIcon = require('../../utils/status_icon');

class Model extends React.Component {

  constructor(props) {
    super(props);

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
    this.tableColRender(this.state.config.table.column);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.style.display === 'none' && !nextState.config.table.loading) {
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
      if(column.key === 'status') {
        column.render = (col, item) => {
          return item.status === 'pass' ? __.pass_status : __.refused_status;
        };
      }
    });
  }

  onInitialize(params) {
    this.getList();
  }

  getList() {
    this.clearState();
    let table = this.state.config.table,
      pageLimit = table.limit || 10;

    request.getList(pageLimit).then((res) => {
      table.data = res.users;
      this.setPagination(table, res);
      this.updateTableData(table, res._url);
    }).catch((res) => {
      table.data = [];
      table.pagination = null;
      this.updateTableData(table, String(res.responseURL));
    });
  }

  //request: get next list
  getNextList(url) {
    let table = this.state.config.table;
    const limit = table.limit || 10;
    request.getNextList(url, limit).then((res) => {
      if (res.users) {
        table.data = res.users;
      } else {
        table.data = [];
      }

      this.setPagination(table, res);
      this.updateTableData(table, res._url);
    }).catch((res) => {
      table.data = [];
      table.pagination = null;
      this.updateTableData(table, String(res.responseURL));
    });
  }

  //rerender: update table data
  updateTableData(table, currentUrl, callback) {
    let newConfig = this.state.config;
    newConfig.table = table;
    newConfig.table.loading = false;

    this.setState({
      config: newConfig
    }, () => {
      this.stores.urls.push(currentUrl);

      callback && callback();
    });
  }

  //set pagination
  setPagination(table, res) {
    let pagination = {},
      next = res.next ? res.next : null;

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

  getNextListData(url) {
    this.getNextList(url);
  }

  onAction(field, actionType, refs, data) {
    switch (field) {
      case 'btnList':
        this.onClickBtnList(data.key, refs, data);
        break;
      case 'table':
        this.onClickTable(actionType, refs, data);
        break;
      case 'filter':
        this.onFilterSearch(actionType, refs, data);
        break;
      default:
        break;
    }
  }

  onClickBtnList(key) {
    let that = this;
    switch (key) {
      case 'refresh':
        that.refresh({
          refreshList: true,
          loadingTable: true
        });
        break;
      default:
        break;
    }
  }

  onClickTable(actionType, refs, data) {
    switch (actionType) {
      case 'pagination':
        let url,
          history = this.stores.urls;

        if (data.direction === 'prev') {
          history.pop();
          if (history.length > 0) {
            url = history.pop();
          }
        } else if (data.direction === 'next') {
          url = data.url;
        } else { //default
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

  onFilterSearch(actionType, refs, data) {
    if (actionType === 'search') {
      this.loadingTable();
      const nameGroup = data.account_name,
        phoneGroup = data.phone_number,
        emailGroup = data.email;


      if (nameGroup) {
        this.getFilteredList(nameGroup);
      } else if (phoneGroup){
        this.getFilteredList(phoneGroup);
      } else if (emailGroup) {
        this.getFilteredList(emailGroup);
      } else{
        const r = {};
        r.refreshList = true;
        r.loadingTable = true;
        this.refresh(r);
      }
    }
  }

  getFilteredList(group) {
    const table = this.state.config.table;
    request.getFilterList().then((res) => {

      table.data = res.users.filter((user) => {
        let has = true;
        for(let field in group) {
          if(!user[field] || !user[field].includes(group[field])) {
            has = false;
          }
        }
        return has;
      });

      this.clearUrls();
      table.pagination = null;
      this.updateTableData(table, res._url);
    }).catch((res) => {
      table.data = [];
      this.clearUrls();
      table.pagination = null;
      this.updateTableData(table, String(res.responseURL));
    });
  }

  refresh(data, params) {
    if (!data) {
      data = {};
    }
    if (!params) {
      params = this.props.params;
    }

    if (data.refreshList) {
      if (data.loadingTable) {
        this.loadingTable();
      }

      let history = this.stores.urls,
        url = history.pop();

      this.getNextListData(url);
    }
  }

  loadingTable() {
    let _config = this.state.config;
    _config.table.loading = true;
    _config.table.data = [];

    this.setState({
      config: _config
    });
  }


  clearUrls() {
    this.stores.urls.length = 0;
  }

  clearState() {
    this.clearUrls();

    let dashboard = this.refs.dashboard;
    if (dashboard) {
      dashboard.clearState();
    }
  }

  render() {
    return (
      <div className="halo-module-approved-application" style={this.props.style}>
        <Main
          ref="dashboard"
          visible={this.props.style.display === 'none' ? false : true}
          onInitialize={this.onInitialize}
          onAction={this.onAction}
          config={this.state.config}
          params={this.props.params}
          getStatusIcon={getStatusIcon}
          __={__} />
      </div>
    );
  }
}

module.exports = Model;
