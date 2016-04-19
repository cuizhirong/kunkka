require('./style/index.less');

var React = require('react');
var Main = require('../../components/main/index');
var BasicProps = require('client/components/basic_props/index');
var allocateModal = require('./pop/allocation_floating_ip/index');
var dissociateModal = require('./pop/dissociate_floating_ip/index');

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
    if(nextProps.style.display === 'none' && this.props.style.display === 'none') {
      return false;
    }
    return true;
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.style.display === 'none' && this.props.style.display === 'none') {
      this.loadingTable();
      this.onInitialize(nextProps.params);
    } else if(this.props.style.display !== 'none' && nextProps.style.display === 'none') {
      this.clearState();
    }
  }

  tableColRender(columns) {
    columns.map((column) => {
      switch(column.key) {
        default:
          break;
      }
    });
  }

  onInitialize(params) {
    var _config = this.state.config,
      table = _config.table;
    if(params[2]) {
      request.getFloatingIPByIDInitialize(params[2]).then((res) => {
        table.data = [res[0].floatingip];
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

  getInitializeListData() {
    var pageLimit = this.state.config.table.limit;
    request.getList(pageLimit).then((res) => {
      var table = this.processTableData(this.state.config.table, res);
      this.updateTableData(table, res._url);
    });
  }

  getNextListData(url, refreshDetail) {
    request.getNextList(url).then((res) => {
      var table = this.processTableData(this.state.config.table, res);
      this.updateTableData(table, res._url, refreshDetail);
    });
  }

  onFilterSearch(actionType, refs, data) {
    if (actionType === 'search') {
      this.loadingTable();

      var floatingIpID = data.floatingip_id;

      if (floatingIpID) {
        request.getFloatingIPByID(floatingIpID.id).then((res) => {
          var table = this.state.config.table;
          table.data = [res.floating_ip];
          this.updateTableData(table, res._url);
        });
      }
    }
  }

  updateTableData(table, currentUrl, refreshDetail) {
    var newConfig = this.state.config;
    newConfig.table = table;
    newConfig.table.loading = false;

    this.setState({
      config: newConfig
    }, () => {
      this.stores.urls.push(currentUrl.split('/v2.0/')[1]);

      var detail = this.refs.dashboard.refs.detail,
        params = this.props.params;
      if(detail && refreshDetail && params.length > 2) {
        detail.refresh();
      }
    });
  }

  processTableData(table, res) {
    if(res.floatingip) {
      table.data = [res.floatingip];
    } else if(res.floatingips) {
      table.data = res.floatingips;
    }

    var pagination = {},
      next = res.floatingips_links ? res.floatingips_links[0] : null;

    if(next && next.rel === 'next') {
      pagination.nextUrl = next.href.split('/v2.0/')[1];
    }

    var history = this.stores.urls;

    if(history.length > 0) {
      pagination.prevUrl = history[history.length - 1];
    }
    table.pagination = pagination;

    return table;
  }

  refresh(data, params) {
    if(!data) {
      data = {};
    }
    if(!params) {
      params = this.props.params;
    }

    if(data.initialList) {
      if(data.loadingTable) {
        this.loadingTable();
      }
      if(data.clearState) {
        this.clearState();
      }

      this.getInitializeListData();
    } else if(data.refreshList) {
      if(params[2]) {
        if(data.loadingDetail) {
          this.loadingDetail();
        }
      } else {
        if(data.loadingTable) {
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

  onAction(field, actionType, refs, data) {
    switch(field) {
      case 'btnList':
        this.onClickBtnList(data.key, refs, data);
        break;
      case 'filter':
        this.onFilterSearch(actionType, refs, data);
        break;
      case 'table':
        this.onClickTable(actionType, refs, data);
        break;
      case 'detail':
        var item = data.rows[0];
        if(item.router_id || item.port_id) {
          this.loadingDetail();
          request.getRelatedSourcesById(item).then(() => {
            this.onClickDetailTabs(actionType, refs, data);
          });
        } else {
          this.onClickDetailTabs(actionType, refs, data);
        }
        break;
      default:
        break;
    }
  }

  onClickDetailTabs(tabKey, refs, data) {
    var {rows} = data;
    var detail = refs.detail;
    var contents = detail.state.contents;

    var isAvailableView = (_rows) => {
      if(_rows.length > 1) {
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
        if(isAvailableView(rows)) {
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
      contents: contents,
      loading: false
    });
  }

  getBasicPropsItems(item) {
    var items = [{
      title: __.floating_ip + __.address,
      content: item.floating_ip_address
    }, {
      title: __.id,
      content: item.id
    }, {
      title: __.ip + __.address,
      content: item.fixed_ip_address ?
        item.fixed_ip_address : '-'
    }, {
      title: __.related + __.instance,
      content: item.server_id ?
        <span>
          <i className="glyphicon icon-instance" />
          <a data-type="router" href={'/admin/instance/' + item.server_id}>
            {item.server_name || '(' + item.server_id.substr(0, 8) + ')'}
          </a>
        </span> : '-'
    }, {
      title: __.related + __.router,
      content: item.router_id ?
        <span>
          <i className="glyphicon icon-router" />
          <span>{item.router_name || '(' + item.router_id.substr(0, 8) + ')'}</span>
        </span> : '-'
    }, {
      title: __.status,
      type: 'status',
      content: getStatusIcon(item.status)
    }, {
      title: __.project + __.id,
      content: item.tenant_id
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
      default:
        break;
    }
  }

  onClickTable(actionType, refs, data) {
    switch(actionType) {
      case 'check':
        this.onClickTableCheckbox(refs, data);
        break;
      case 'pagination':
        var url,
          history = this.stores.urls;

        if(data.direction === 'next') {
          url = data.url;
        } else {
          history.pop();
          if(history.length > 0) {
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

  onClickBtnList(actionType, refs, data) {
    var rows = data.rows;

    switch(actionType) {
      case 'allocate':
        allocateModal();
        break;
      case 'dissociate':
        dissociateModal(rows[0]);
        break;
      case 'refresh':
        var params = this.props.params,
          refreshData = {};

        if(params[2]) {
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
    for(let key in btns) {
      switch(key) {
        case 'allocate':
          btns[key].disabled = (rows.length === 1) ? false : true;
          break;
        case 'dissociate':
          btns[key].disabled = (rows.length === 1 && rows.instance_id) ? false : true;
          break;
        default:
          break;
      }
    }

    return btns;
  }

  render() {
    return (
      <div className="halo-module-floating-ip" style={this.props.style}>
        <Main
          ref="dashboard"
          visible={this.props.style.display === 'none' ? false : 'none'}
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
