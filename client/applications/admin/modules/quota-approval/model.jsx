require('./style/index.less');

const React = require('react');
const Main = require('client/components/main_paged/index');

const agreeApplication = require('./pop/agree/index');
const refuseApplication = require('./pop/refuse/index');

const config = require('./config.json');
const __ = require('locale/client/admin.lang.json');
const request = require('./request');
const getStatusIcon = require('../../utils/status_icon');
const QuotaDetail = require('./detail/quota_detail.jsx');

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
        case 'applicant':
          column.formatter = function(col, item) {
            return item.user.name;
          };
          break;
        case 'full_name':
          column.render = function(col, item) {
            return item.user.full_name;
          };
          break;
        case 'company':
          column.render = function(col, item) {
            return item.user.company;
          };
          break;
        default:
          break;
      }
    });
  }

  onInitialize() {
    this.getList();
  }

  clone(objectToBeCloned) {
    if (!(objectToBeCloned instanceof Object)) {
      return objectToBeCloned;
    }

    const Constructor = objectToBeCloned.constructor;
    let objectClone = new Constructor();
    for (let prop in objectToBeCloned) {
      objectClone[prop] = this.clone(objectToBeCloned[prop]);
    }

    return objectClone;
  }

  getList() {
    this.clearState();
    let table = this.state.config.table,
      pageLimit = table.limit || 10;

    request.getList(pageLimit).then((res) => {
      table.data = res.quota;
      this.setPagination(table, res);
      this.updateTableData(table, res._url);
    }).catch((err) => {
      table.data = [];
      table.pagination = null;
      this.updateTableData(table, String(err.responseURL));
    });
  }

  //request: get next list
  getNextList(url, refreshDetail) {
    let table = this.state.config.table;
    const pageLimit = table.limit || 10;
    request.getNextList(url, pageLimit).then((res) => {
      if (res.quota) {
        table.data = res.quota;
      } else {
        table.data = [];
      }

      this.setPagination(table, res);
      this.updateTableData(table, res._url, refreshDetail);
    }).catch((err) => {
      table.data = [];
      table.pagination = null;
      this.updateTableData(table, String(err.responseURL));
    });
  }

  //rerender: update table data
  updateTableData(table, currentUrl, refreshDetail, callback) {
    let newConfig = this.state.config;
    newConfig.table = table;
    newConfig.table.loading = false;

    this.setState({
      config: newConfig
    }, () => {
      this.stores.urls.push(currentUrl);
      let detail = this.refs.dashboard.refs.detail,
        params = this.props.params;
      if (detail && refreshDetail && params.length > 2) {
        detail.refresh();
      }
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

  getNextListData(url, refreshDetail) {
    this.getNextList(url, refreshDetail);
  }

  onAction(field, actionType, refs, data) {
    switch (field) {
      case 'btnList':
        this.onClickBtnList(data.key, refs, data);
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

  onClickDetailTabs(tabKey, refs, data) {
    let {rows} = data;
    let detail = refs.detail;
    let contents = detail.state.contents;
    switch(tabKey) {
      case 'detail':
        if (rows.length === 1) {
          contents[tabKey] = (
            <QuotaDetail originQuota={rows[0].originQuota} addedQuota= {rows[0].addedQuota} key={rows[0].id} />
          );
        }
        break;
      default:
        break;
    }

    detail.setState({
      contents: contents,
      loading: false
    });
  }

  loadingDetail() {
    this.refs.dashboard.refs.detail.loading();
  }

  onClickSearch(actionType, refs, data) {
    if (actionType === 'click') {
      this.loadingTable();

      if(data.text) {
        request.getSearchList().then(res => {
          let list = res.quota;
          let newList = list.filter((item) => {
            return item.user.name === data.text || item.user.name.includes(data.text);
          });
          let newConfig = this.state.config;
          newConfig.table.data = newList;
          newConfig.table.loading = false;
          newConfig.table.pagination = null;

          this.setState({
            config: newConfig
          });
        });
      } else {
        this.onInitialize();
      }
    }
  }

  onClickBtnList(key, refs, data) {
    let rows = data.rows;
    let that = this;

    switch (key) {
      case 'agree':
        if(rows.length === 1) {
          agreeApplication(this.clone(rows[0]), (res) => {
            that.refresh({
              refreshList: true,
              loadingTable: true
            });
          });
        }
        break;
      case 'refuse':
        if (rows.length === 1) {
          refuseApplication(this.clone(rows[0]), (res) => {
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
          refreshDetail: true,
          loadingTable: true,
          loadingDetail: true
        });
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
      if (params[2]) {
        if (data.loadingDetail) {
          this.loadingDetail();
          this.refs.dashboard.setRefreshBtnDisabled(true);
        }
      } else {
        if (data.loadingTable) {
          this.loadingTable();
        }
      }

      let history = this.stores.urls,
        url = history.pop();
      this.getNextListData(url, data.refreshDetail);
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
      <div className="halo-module-quota-approval" style={this.props.style}>
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
