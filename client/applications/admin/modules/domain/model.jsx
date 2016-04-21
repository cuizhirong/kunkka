require('./style/index.less');

//react components
var React = require('react');
var Main = require('../../components/main/index');

//detail components
var BasicProps = require('client/components/basic_props/index');
var modifyDomain = require('./pop/modify_domain/index');
//var deactivateDomain = require('./pop/deactivate/index');
var activateDomain = require('./pop/activate/index');

var request = require('./request');
var config = require('./config.json');
var moment = require('client/libs/moment');
var __ = require('locale/client/admin.lang.json');
var getStatusIcon = require('../../utils/status_icon');

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
      this.onInitialize(nextProps.params);
    } else if(this.props.style.display !== 'none' && nextProps.style.display === 'none') {
      this.clearState();
    }
  }

  tableColRender(columns) {
    columns.map((column) => {
      switch (column.key) {
        case 'status':
          column.render = (col, item, i) => {
            return item.enabled ?
              <span className="label-active">{__.activated}</span> : <span className="label-down">{__.inactive}</span>;
          };
          break;
        default:
          break;
      }
    });
  }

//initialize table data
  onInitialize(params) {
    var _config = this.state.config,
      table = _config.table;

    if (params[2]) {
      request.getDomainByIDInitialize(params[2]).then((res) => {
        table.data = [res[0].domain];
        this.updateTableData(table, res[0]._url);
      });
    } else {
      var pageLimit = this.state.config.table.limit;
      request.getListInitialize(pageLimit).then((res) => {
        var newTable = this.processTableData(table, res[0]);
        this.updateTableData(newTable, res[0]._url);
      });
    }
  }

//request: get single data(pathList[2] is server_id)
  getSingleData(domainID) {
    request.getServerByID(domainID).then((res) => {
      var table = this.state.config.table;
      table.data = [res.domain];
      this.updateTableData(table, res._url);
    });
  }

//request: get list data(according to page limit)
  getInitialListData() {
    var pageLimit = this.state.config.table.limit;
    request.getList(pageLimit).then((res) => {
      var table = this.processTableData(this.state.config.table, res);
      this.updateTableData(table, res._url);
    });
  }

//request: jump to next page according to the given url
  getNextListData(url, refreshDetail) {
    request.getNextList(url).then((res) => {
      var table = this.processTableData(this.state.config.table, res);
      this.updateTableData(table, res._url);
    });
  }

//request: search request
  onClickSearch(actionType, refs, data) {
    if (actionType === 'click') {
      this.loadingTable();
      request.getDomainByID(data.text).then((res) => {
        var table = this.state.config.table;
        table.data = [res.domain];
        this.updateTableData(table, res._url);
      });
    }
  }

//rerender: update table data
  updateTableData(table, currentUrl, refreshDetail, callback) {
    var newConfig = this.state.config;
    newConfig.table = table;
    newConfig.table.loading = false;

    this.setState({
      config: newConfig
    }, () => {
      this.stores.urls.push(currentUrl.split('/v3/')[1]);

      var detail = this.refs.dashboard.refs.detail,
        params = this.props.params;
      if (detail && refreshDetail && params.length > 2) {
        detail.refresh();
      }

      callback && callback();
    });
  }

//change table data structure: to record url history
  processTableData(table, res) {
    if (res.domain) {
      table.data = [res.domain];
    } else if (res.domains) {
      table.data = res.domains;
    }

    var pagination = {},
      next = res.links ? res.links.next : null;

    if (next) {
      pagination.nextUrl = next.href.split('/v3/')[1];
    }

    var history = this.stores.urls;

    if (history.length > 0) {
      pagination.prevUrl = history[history.length - 1];
    }
    table.pagination = pagination;

    return table;
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

    this.setState({
      config: _config
    });
  }

  loadingDetail() {
    this.refs.dashboard.refs.detail.loading();
  }

  clearState() {
    this.stores = {
      urls: []
    };
    this.refs.dashboard.clearState();
  }

//*********************************************//
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

  onClickTable(actionType, refs, data) {
    switch (actionType) {
      case 'check':
        this.onClickTableCheckbox(refs, data);
        break;
      case 'pagination':
        var url,
          history = this.stores.urls;

        if (data.direction === 'next') {
          url = data.url;
        } else {
          history.pop();
          if (history.length > 0) {
            url = history.pop();
          }
        }

        this.loadingTable();
        this.getNextListData(url);
        break;
      default:
        break;
    }
  }

  onClickBtnList(key, refs, data) {
    var {rows} = data;

    var that = this;
    switch(key) {
      case 'modify_domain':
        modifyDomain(rows[0], null, function(_data) {
          that.refresh({
            refreshList: true,
            refreshDetail: true
          });
        });
        break;
      case 'activate_domain':
        activateDomain(rows[0], null, function(_data) {
          that.refresh({
            refreshList: true,
            refreshDetail: true
          });
        });
        break;
      case 'deactivate_domain':
        /*deactivateDomain(rows[0], null, function(_data) {
          that.refresh({
            refreshList: true,
            refreshDetail: true
          });
        });*/
        break;
      case 'refresh':
        var params = this.props.params,
          refreshData = {};

        if (params[2]) {
          refreshData.refreshList = true;
          refreshData.refreshDetail = true;
          refreshData.loadingTable = true;
          refreshData.loadingDetail = true;
        } else {
          refreshData.initialList = true;
          refreshData.loadingTable = true;
          refreshData.clearState = true;
        }

        this.refresh(refreshData, params);
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
    var singleRow = rows.length === 1;
    var status = singleRow ? rows[0].enabled : null;

    for(let key in btns) {
      switch (key) {
        case 'modify_domain':
          btns[key].disabled = !singleRow;
          break;
        case 'activate_domain':
          btns[key].disabled = !singleRow || status;
          break;
        case 'deactivate_domain':
          //btns[key].disabled = !singleRow || !status;
          btns[key].disabled = true;
          break;
        default:
          break;
      }
    }

    return btns;
  }

  onClickDetailTabs(tabKey, refs, data) {
    var {rows} = data;
    var detail = refs.detail;
    var contents = detail.state.contents;

    var isAvailableView = (_rows) => {
      if (_rows.length > 1) {
        contents[tabKey] = (
          <div className="no-data-desc">
            <p>{__.view_is_unavailable}</p>
          </div>
        );
        return false;
      } else {
        return true;
      }
    };

    switch(tabKey) {
      case 'description':
        if (isAvailableView(rows)) {
          var basicPropsItem = this.getBasicPropsItems(rows[0]);
          contents[tabKey] = (
            <div>
              <BasicProps
                title={__.basic + __.properties}
                defaultUnfold={true}
                tabKey={'description'}
                items={basicPropsItem}
                rawItem={rows[0]}
                onAction={this.onDetailAction.bind(this)}
                dashboard={this.refs.dashboard ? this.refs.dashboard : null} />
            </div>
          );
        }
        break;
      default:
        break;
    }

    detail.setState({
      contents: contents
    });
  }

  getBasicPropsItems(item) {
    var items = [{
      title: __.name,
      content: item.name,
      type: 'editable'
    }, {
      title: __.id,
      content: item.id
    }, {
      title: __.describe,
      content: item.description
    }, {
      title: __.status,
      content: item.enabled ? __.activated : __.inactive
    }];

    return items;
  }

  onDetailAction(tabKey, actionType, data) {
    switch(tabKey) {
      case 'description':
        this.onDescriptionAction(actionType, data);
        break;
      default:
        break;
    }
  }

  onDescriptionAction(actionType, data) {
    switch(actionType) {
      case 'edit_name':
        var {rawItem, newName} = data;
        request.editDomain(rawItem.id, {
          name: newName
        }).then((res) => {
          this.refresh({
            refreshList: true,
            refreshDetail: true
          });
        });
        break;
      default:
        break;
    }
  }

  render() {
    return (
      <div className="halo-module-domain" style={this.props.style}>
        <Main
          ref="dashboard"
          visible={this.props.style.display === 'none' ? false : true}
          onInitialize={this.onInitialize}
          onAction={this.onAction}
          config={this.state.config}
          params={this.props.params}
          getStatusIcon={getStatusIcon}
        />
      </div>
    );
  }
}

module.exports = Model;
