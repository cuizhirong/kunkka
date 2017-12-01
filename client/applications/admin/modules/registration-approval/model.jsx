require('./style/index.less');

const React = require('react');
const Main = require('client/components/main_paged/index');

const agreeApplicationModal = require('./pop/agree/index');
const refuseApplicationModal = require('./pop/refuse/index');

const config = require('./config.json');
const __ = require('locale/client/admin.lang.json');
const request = require('./request');
const getStatusIcon = require('../../utils/status_icon');
const Notification = require('client/uskin/index').Notification;
const getErrorMessage = require('../../utils/error_message');
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
    const columns = this.state.config.table.column;
    this.tableColRender(columns);
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
      switch (column.key) {
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
    let table = this.state.config.table,
      pageLimit = localStorage.getItem('page_limit');

    request.getList(pageLimit).then((res) => {
      table.data = res.users;
      this.setPagination(table, res);
      this.updateTableData(table, res._url);
    }).catch((err) => {
      table.data = [];
      table.pagination = null;
      this.updateTableData(table, String(err.responseURL));
    });
  }

//request: get next list
  getNextList(url) {
    let table = this.state.config.table;
    const limit = localStorage.getItem('page_limit');
    request.getNextList(url, limit).then((res) => {
      if (res.users) {
        table.data = res.users;
      } else {
        table.data = [];
      }

      this.setPagination(table, res);
      this.updateTableData(table, res._url);
    }).catch((err) => {
      table.data = [];
      table.pagination = null;
      this.updateTableData(table, String(err.responseURL));
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

  onFilterSearch(actionType, refs, data) {
    if (actionType === 'search') {
      this.loadingTable();

      const accountNameGroup = data.account_name,
        phoneGroup = data.phone_number,
        emailGroup = data.email;

      if (accountNameGroup) {
        this.getFilteredList(accountNameGroup);
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

  onClickBtnList(key, refs, data) {
    let rows = data.rows;
    let that = this;
    const enableCreateNetwork = HALO.settings.enable_register_approve_create_resource;

    switch (key) {
      case 'agree':
        if (rows.length === 1) {
          agreeApplicationModal(rows[0], (res) => {
            if(enableCreateNetwork) {
              that.createNetworkAndSoOn(res);
            }
            that.refresh({
              refreshList: true,
              loadingTable: true
            });
          });
        }
        break;
      case 'refuse':
        if (rows.length === 1) {
          refuseApplicationModal(rows[0], (res) => {
            that.refresh({
              refreshList: true,
              loadingTable: true
            });
          });
        }
        break;
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

  createNetworkAndSoOn(res) {
    const pId = res.user.default_project_id;
    const userName = res.user.name;

    Notification.addNotice({
      id: pId,
      content: __.creating_network_msg1 + userName +
        __.creating_network_msg2,
      type: 'info',
      isAutoHide: false,
      showIcon: true,
      icon: 'loading-notification'
    });

    request.createNetworkAndSoOn(pId).then(() => {
      Notification.updateNotice({
        id: pId,
        content: __.successful_creation,
        type: 'success',
        isAutoHide: true,
        icon: 'icon-status-active'
      });
    }).catch((err) => {
      let errorContent = '';
      if(err.name === 'noExNetwork') {
        errorContent = __.error_happened;
      } else {
        errorContent = getErrorMessage(err);
      }

      Notification.updateNotice({
        id: pId,
        content: errorContent,
        type: 'danger',
        isAutoHide: true,
        icon: 'icon-status-warning'
      });
    });
  }

  onClickTable(actionType, refs, data) {
    switch (actionType) {
      case 'check':
        this.onClickTableCheckbox(refs, data);
        break;
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

  onClickTableCheckbox(refs, data) {
    let {rows} = data,
      btnList = refs.btnList,
      btns = btnList.state.btns;

    btnList.setState({
      btns: this.btnListRender(rows, btns)
    });
  }

  btnListRender(rows, btns) {
    const onlyOneChecked = rows.length === 1 ? true : false;

    if (onlyOneChecked) {
      btns.agree.disabled = false;
      btns.refuse.disabled = false;
    } else {
      btns.agree.disabled = true;
      btns.refuse.disabled = true;
    }
    return btns;
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
      <div className="halo-module-account-apply" style={this.props.style}>
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
