require('./style/index.less');

const React = require('react');
const Main = require('client/components/main_paged/index');
const deleteModal = require('./pop/delete_namespace/index');

const editModal = require('./pop/edit_namespace/index');

const request = require('./request');
const config = require('./config.json');
const __ = require('locale/client/admin.lang.json');
const router = require('client/utils/router');
const Overview = require('./detail/overview/index');
const Content = require('./detail/content/index');
const moment = require('client/libs/moment');

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
    let column = this.state.config.table.column;
    this.tableColRender(column);
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
      this.getList();
    }
  }


  tableColRender(columns) {
    columns.map((column) => {
      switch (column.key) {
        case 'description':
          column.render = (col, item) => {
            let typeCount = item.resource_type_associations ? item.resource_type_associations.length : 0;
            if(typeCount <= 3) {
              typeCount = 3;
            }
            return (
              <div style={{height: 30 * typeCount}} className="namespace-description">
                {item.description.length > typeCount * 40 ? item.description.slice(0, typeCount * 40) + '...' : item.description }
              </div>
            );
          };
          break;
        case 'resource_type':
          column.render = (col, item) => {
            if(item.resource_type_associations) {
              return item.resource_type_associations.map((type, index) => {
                return <div key={index}>{type.name}</div>;
              });
            } else {
              return '';
            }
          };
          break;
        case 'visibility':
          column.render = (col, item) => {
            return __[item.visibility];
          };
          break;
        case 'protected':
          column.render = (col, item) => {
            return item.protected === true ? __.yes : __.no;
          };
          break;
        default:
          break;
      }
    });
  }

  //initialize table data
  onInitialize(params) {
    this.loadingTable();
    if (params && params[2]) {
      this.getSingle(params[2]);
    } else {
      this.getList();
    }
  }

  //request: get single data by namespace
  getSingle(namespace) {
    this.clearState();

    let table = this.state.config.table;
    request.getSingle(namespace).then((res) => {
      table.data = res.namespaces;
      this.setPagination(table, res);
      this.updateTableData(table, res._url, true, () => {
        let pathList = router.getPathList();
        router.replaceState('/admin/' + pathList.slice(1).join('/'), null, null, true);
      });
    }).catch((err) => {
      table.data = [];
      table.pagination = null;
      this.updateTableData(table, String(err.responseURL));
    });
  }

  //request: get list
  getList() {
    this.clearState();

    let table = this.state.config.table;
    let pageLimit = localStorage.getItem('page_limit');

    request.getList(pageLimit).then((res) => {
      table.data = res.namespaces;
      this.setPagination(table, res);
      this.updateTableData(table, res._url);
    }).catch((err) => {
      table.data = [];
      table.pagination = null;
      this.updateTableData(table, String(err.responseURL));
    });
  }

  getNextList(url, refreshDetail) {
    let table = this.state.config.table;
    request.getNextList(url).then((res) => {
      if (res.namespaces) {
        table.data = res.namespaces;
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
    table.data.forEach((ns) => {
      ns.id = ns.namespace;
    });
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
      pagination.nextUrl = '/proxy/glance' + next;
    }

    let history = this.stores.urls;

    if (history.length > 0) {
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

  //refresh: according to the given data rules
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
      if (data.clearState) {
        this.clearState();
      }

      this.getInitialListData();
    } else if (data.refreshList) {
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

  loadingDetail() {
    this.refs.dashboard.refs.detail.loading();
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

  onAction(field, actionType, refs, data) {
    switch (field) {
      case 'btnList':
        this.onClickBtnList(data.key, refs, data);
        break;
      case 'search':
        this.onSearch(actionType, refs, data);
        break;
      case 'table':
        this.onClickTable(actionType, refs, data);
        break;
      case 'detail':
        this.onClickDetailTabs(actionType, refs, data);
        break;
      case 'page_limit':
        this.onInitialize();
        break;
      default:
        break;
    }
  }

  onSearch(actionType, refs, data) {
    if (actionType === 'click') {
      this.loadingTable();
      this.clearState();
      if(data.text) {
        let table = this.state.config.table;
        let pageLimit = localStorage.getItem('page_limit');

        request.getFilterList(data.text, pageLimit).then((res) => {
          table.data = res.namespaces;
          this.setPagination(table, res);
          this.updateTableData(table, res._url);
        }).catch((err) => {
          table.data = [];
          table.pagination = null;
          this.updateTableData(table, String(err.responseURL));
        });
      } else {
        this.onInitialize();
      }
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
    switch(key) {
      case 'edit':
        editModal(rows[0], (res) => {
          this.refresh({
            refreshList: true,
            refreshDetail: true
          });
        });
        break;
      case 'delete':
        deleteModal(rows[0], (res) => {
          this.refresh({
            refreshList: true,
            refreshDetail: true
          });
        });
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

  onClickTableCheckbox(refs, data) {
    let {rows} = data,
      btnList = refs.btnList,
      btns = btnList.state.btns;

    btnList.setState({
      btns: this.btnListRender(rows, btns)
    });
  }

  btnListRender(rows, btns) {
    let sole = rows.length === 1 ? rows[0] : null;
    let isProtected = sole ? rows[0].protected : true;

    for(let key in btns) {
      switch (key) {
        case 'edit':
          btns[key].disabled = sole ? false : true;
          break;
        case 'delete':
          btns[key].disabled = isProtected ? true : false;
          break;
        default:
          break;
      }
    }

    return btns;
  }

  onClickDetailTabs(tabKey, refs, data) {
    let {rows} = data;
    let detail = refs.detail;
    let contents = detail.state.contents;
    let syncUpdate = true;

    switch(tabKey) {
      case 'overview':
        if (rows.length === 1) {
          contents[tabKey] = <Overview namespace={rows[0]} __={__} />;
        }
        break;
      case 'content':
        if (rows.length === 1) {
          contents[tabKey] = <Content namespace={rows[0]} />;
        }
        break;
      default:
        break;
    }

    if (syncUpdate) {
      detail.setState({
        contents: contents,
        loading: false
      });
    } else {
      detail.setState({
        loading: true
      });
    }
  }

  render() {
    return (
      <div className="halo-module-metadata-defs" style={this.props.style}>
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
