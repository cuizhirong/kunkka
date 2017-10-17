require('./style/index.less');

const React = require('react');
const Main = require('client/components/main_paged/index');

const BasicProps = require('client/components/basic_props/index');
const DetailMinitable = require('client/components/detail_minitable/index');
const getStatusIcon = require('client/applications/admin/utils/status_icon');

const deleteModal = require('client/components/modal_delete/index');
const createSubnet = require('./pop/create_subnet/index');
const connectRouter = require('./pop/connect_router/index');
const disconnectRouter = require('./pop/disconnect_router/index');
const addInstance = require('./pop/add_instance/index');
const modifySubnet = require('./pop/modify_subnet/index');

const config = require('./config.json');
const __ = require('locale/client/admin.lang.json');
const request = require('./request');
const getErrorMessage = require('client/applications/admin/utils/error_message');

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

  tableColRender(columns) {
    columns.map((column) => {
      switch (column.key) {
        case 'prv_network':
          column.render = (col, item, i) => {
            return item.network ?
              <span>
                <i className="glyphicon icon-network" />
                <a data-type="router" href={'/admin/network/' + item.network.id}>
                  {item.network.name || '(' + item.network.id.substr(0, 8) + ')'}
                </a>
              </span> : '';
          };
          break;
        case 'assc_router':
          column.render = (col, item, i) => {
            if(item.router) {
              return item.router.id ?
                <span>
                  <i className="glyphicon icon-router" />
                  <a data-type="router" href={'/admin/router/' + item.router.id}>
                    {item.router.name || '(' + item.router.id.substr(0, 8) + ')'}
                  </a>
                </span> : '';
            } else {
              return '';
            }
          };
          break;
        case 'ip_ver':
          column.render = (col, item, i) => {
            return item.ip_version === 4 ? 'IP v4' : item.ip_version;
          };
          break;
        case 'enable_dhcp':
          column.render = (col, item, i) => {
            return item.enable_dhcp ? __.yes : __.no;
          };
          break;
        case 'restrict':
          column.render = (col, item, i) => {
            return item.port_security_enabled ?
              <span className="label-active">{__.on}</span> : <span className="label-down">{__.off}</span>;
          };
          break;
        default:
          break;
      }
    });
  }

  onInitialize(params) {
    if(params[2]) {
      this.getSingle(params[2]);
    } else {
      this.getList(false);
    }
  }

  getSingle(id, forceUpdate) {
    this.clearState();

    let table = this.state.config.table;
    request.getSubnetByID(id).then((res) => {
      if (res.list) {
        table.data = res.list;
      } else {
        table.data = [];
      }
      this.setPagination(table, res);
      this.updateTableData(table, res._url);
    }).catch((res) => {
      table.data = [];
      table.pagination = {};
      this.updateTableData(table, res._url);
    });
  }

  getInitializeListData() {
    this.getList(false);
  }
  getList(detailRefresh) {
    this.clearState();
    let table = this.state.config.table,
      pageLimit = table.limit;

    request.getList(pageLimit).then((res) => {
      table.data = res.list;
      this.setPagination(table, res);
      this.updateTableData(table, res._url, detailRefresh);
    }).catch((res) => {
      table.data = [];
      table.pagination = null;
      this.updateTableData(table, String(res.responseURL));
    });
  }

//request: get next list
  getNextList(url, refreshDetail) {
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
      this.updateTableData(table, String(res.responseURL));
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

  getNextListData(url, refreshDetail) {
    this.getNextList(url, refreshDetail);
  }

  onAction(field, actionType, refs, data) {
    switch (field) {
      case 'btnList':
        this.onClickBtnList(data.key, refs, data);
        break;
      case 'table':
        this.onClickTable(actionType, refs, data);
        break;
      case 'search':
        this.onClickSearch(actionType, refs, data);
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

  onClickBtnList(key, refs, data) {
    let rows = data.rows;
    let that = this;
    switch (key) {
      case 'refresh':
        this.refresh({
          refreshList: true,
          refreshDetail: true,
          loadingTable: true,
          loadingDetail: true
        });
        break;
      case 'create':
        createSubnet(rows[0], null, () => {
          that.refresh({
            refreshList: true,
            refreshDetail: true,
            loadingTable: true,
            loadingDetail: true
          });
        });
        break;
      case 'connect_router':
        connectRouter(rows[0], null, () => {
          that.refresh({
            refreshList: true,
            refreshDetail: true,
            loadingTable: true,
            loadingDetail: true
          });
        });
        break;
      case 'disconnect_router':
        disconnectRouter(rows[0], null, () => {
          that.refresh({
            refreshList: true,
            refreshDetail: true,
            loadingTable: true,
            loadingDetail: true
          });
        });
        break;
      case 'add_instance':
        addInstance(rows[0], false, null, () => {
          that.refresh({
            refreshList: true,
            refreshDetail: true,
            loadingTable: true,
            loadingDetail: true
          });
        });
        break;
      case 'modify_subnet':
        modifySubnet(rows[0], null, () => {
          that.refresh({
            refreshList: true,
            refreshDetail: true,
            loadingTable: true,
            loadingDetail: true
          });
        });
        break;
      case 'delete':
        deleteModal({
          __: __,
          action: 'delete',
          type: 'subnet',
          data: rows,
          onDelete: function(_data, cb) {
            request.deleteSubnets(rows).then((res) => {
              cb(true);
              that.refresh({
                refreshList: true,
                refreshDetail: true,
                loadingTable: true,
                loadingDetail: true
              });
            }).catch((error) => {
              cb(false, getErrorMessage(error));
            });
          }
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
      case 'filtrate':
        delete data.rows;
        this.clearState();
        let table = this.state.config.table;
        request.getFilterList(data).then((res) => {
          table.data = res.subnet;
          this.setPagination(table, res);
          this.updateTableData(table, res._url);
        }).catch((res) => {
          table.data = [];
          table.pagination = null;
          this.updateTableData(table, String(res.responseURL));
        });
        this.loadingTable();
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
    let length = rows.length,
      external = rows[0] ? rows[0].network['router:external'] : null,
      shared = rows[0] ? rows[0].network.shared : null;
    for(let key in btns) {
      switch (key) {
        case 'connect_router':
          if (length === 1 && !rows[0].router.id && !shared && !external && rows[0].gateway_ip) {
            btns[key].disabled = false;
          } else {
            btns[key].disabled = true;
          }
          break;
        case 'disconnect_router':
          if (length === 1 && rows[0].router.id && !external) {
            btns[key].disabled = false;
          } else {
            btns[key].disabled = true;
          }
          break;
        case 'add_instance':
          btns[key].disabled = (length === 1 && !external) ? false : true;
          break;
        case 'modify_subnet':
          btns[key].disabled = (length === 1 && !shared && !external) ? false : true;
          break;
        case 'delete':
          let disableDelete = rows.some((row) => {
            return row.network.shared || row.network['router:external'];
          });
          btns[key].disabled = (rows.length >= 1 && !disableDelete) ? false : true;
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

    let isAvailableView = (_rows) => {
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
          let basicPropsItem = this.getBasicPropsItems(rows[0]),
            virtualInterfaceItem = this.getVirtualInterfaceItems(rows[0]);
          contents[tabKey] = (
            <div>
              <BasicProps title={__.basic + __.properties}
                defaultUnfold={true}
                tabKey={"description"}
                rawItem={rows[0]}
                onAction={this.onDetailAction.bind(this)}
                items={basicPropsItem ? basicPropsItem : []}/>
              <DetailMinitable
                __={__}
                title={__.port}
                defaultUnfold={true}
                tableConfig={virtualInterfaceItem ? virtualInterfaceItem : []}/>
            </div>
          );
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
    let that = this;
    switch(actionType) {
      case 'edit_name':
        let {rawItem, newName} = data;
        request.editSubnetName(rawItem, newName).then((res) => {
          this.refresh({
            detailRefresh: true
          }, true);
        });
        break;
      case 'rmv_port':
        deleteModal({
          __: __,
          action: 'terminate',
          type: 'port',
          data: [data.rawItem],
          onDelete: function(_data, cb) {
            request.deletePort(data.rawItem).then(() => {
              that.refresh({
                refreshList: true,
                refreshDetail: true,
                loadingTable: true,
                loadingDetail: true
              });
              cb(true);
            }).catch(error => {
              cb(false, getErrorMessage(error));
            });
          }
        });
        break;
      case 'connect_inst':
        addInstance(data.rawItem, true, null, function() {
          that.refresh({
            detailRefresh: true
          }, true);
        });
        break;
      default:
        break;
    }
  }

  getBasicPropsItems(item) {
    let data = [{
      title: __.name,
      content: item.name || '(' + item.id.substring(0, 8) + ')',
      type: item.network.shared || item.network['router:external'] ? '' : 'editable'
    }, {
      title: __.id,
      content: item.id
    }, {
      title: __.prv_network,
      content: item.network ?
        <span>
          <i className="glyphicon icon-network" />
          <a data-type="router" href={'/admin/network/' + item.network.id}>
            {item.network.name || '(' + item.network.id.substring(0, 8) + ')'}
          </a>
        </span> : null
    }, {
      title: __.associate + __.router,
      content: item.router.id ?
        <span>
          <i className="glyphicon icon-router" />
          <a data-type="router" href={'/admin/router/' + item.router.id}>
            {item.router.name || '(' + item.router.id.substring(0, 8) + ')'}
          </a>
        </span> : '-'
    }, {
      title: __.gateway + __.address,
      content: item.gateway_ip ? item.gateway_ip : '-'
    }, {
      title: __.dns,
      content: item.dns_nameservers.length > 0 ? item.dns_nameservers.join(', ') : '-'
    }, {
      title: __.ip + __.version,
      content: 'IP v' + item.ip_version
    }, {
      title: __.cidr,
      content: item.cidr
    }, {
      title: __.project_id,
      content: item.project_id
    }, {
      title: __.address + __.allocation + __.pool,
      content: item.allocation_pools[0] ?
        '(Start) ' + item.allocation_pools[0].start + ' - ' + '(End) ' + item.allocation_pools[0].end
        : null
    }, {
      title: 'DHCP',
      content: item.enable_dhcp ?
         <span className="label-active">{__.on}</span> : <span className="label-down">{__.off}</span>
    }, {
      title: __.security + __.restrict,
      content: item.port_security_enabled ?
         <span className="label-active">{__.on}</span> : <span className="label-down">{__.off}</span>
    }, {
      title: __.share_network,
      content: item.network.shared ? __.yes : __.no
    }, {
      title: __.host_routes,
      content: item.host_routes.length > 0 ? <div>{
        item.host_routes.map((route, index) => <div key={index}>{'(' + __.cidr + ') ' + route.destination + ' - (' + __.descend + ') ' + route.nexthop}</div>)
      }</div> : '-'
    }];

    return data;
  }

  getVirtualInterfaceItems(item) {
    let tableContent = [];
    item.ports.forEach((element, index) => {
      let dataObj = {
        id: index + 1,
        name: <a data-type="router" href={'/admin/port/' + element.id}>{element.name ? element.name : '(' + element.id.substring(0, 8) + ')'}</a>,
        ip_address: element.fixed_ips[0].ip_address,
        mac_address: element.mac_address,
        instance: (function() {
          if (element.device_owner && element.device_owner.indexOf('compute') > -1) {
            if (element.server && element.server.status === 'SOFT_DELETED') {
              return (
                <div>
                  <i className="glyphicon icon-instance"></i>{'(' + element.device_id.substr(0, 8) + ')'}
                </div>
              );
            } else if (element.server) {
              return (
                <div>
                  <i className="glyphicon icon-instance"></i>
                  <a data-type="router" href={'/admin/instance/' + element.device_id}>{element.server.name}</a>
                </div>
              );
            }
          } else if (element.device_owner === 'network:ha_router_replicated_interface' && item.router) {
            return (
              <div>
                <i className="glyphicon icon-router"></i>
                <a data-type="router" href={'/admin/router/' + element.device_id}>{item.router.name || '(' + element.device_id.substr(0, 8) + ')'}</a>
              </div>
            );
          } else {
            return <div>{__[element.device_owner]}</div>;
          }
        })(),
        status: getStatusIcon(element.status),
        operation: (function(_this) {
          if (!element.device_owner) {
            return (
              <div>
                <i className="glyphicon icon-associate action" onClick={_this.onDetailAction.bind(_this, 'description', 'connect_inst', {rawItem: element})}/>
                <i className="glyphicon icon-delete" onClick={_this.onDetailAction.bind(_this, 'description', 'rmv_port', {rawItem: element})} />
              </div>
            );
          } else if (element.device_owner !== 'network:dhcp' && element.device_owner !== 'network:ha_router_replicated_interface') {
            return (
              <div>
                <i className="glyphicon icon-delete" onClick={_this.onDetailAction.bind(_this, 'description', 'rmv_port', {rawItem: element})} />
              </div>
            );
          } else {
            return '-';
          }
        })(this)
      };
      tableContent.push(dataObj);
    });

    let tableConfig = {
      column: [{
        title: __.name,
        key: 'name',
        dataIndex: 'name'
      }, {
        title: __.ip + __.address,
        key: 'ip_address',
        dataIndex: 'ip_address'
      }, {
        title: 'Mac ' + __.address,
        key: 'mac_address',
        dataIndex: 'mac_address'
      }, {
        title: __.related + __.resource,
        key: 'instance',
        dataIndex: 'instance'
      }, {
        title: __.status,
        key: 'status',
        dataIndex: 'status'
      }, {
        title: __.operation,
        key: 'operation',
        dataIndex: 'operation'
      }],
      data: tableContent,
      dataKey: 'id',
      hover: true
    };

    return tableConfig;
  }

  //refresh: according to the given data rules
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
          this.refs.dashboard.setRefreshBtnDisabled(true);
        }
      } else {
        if(data.loadingTable) {
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

  render() {
    return (
      <div className="halo-module-subnet" style={this.props.style}>
        <Main
          ref="dashboard"
          visible={this.props.style.display === 'none' ? false : true}
          onInitialize={this.onInitialize}
          onAction={this.onAction}
          onClickDetailTabs={this.onClickDetailTabs.bind(this)}
          config={this.state.config}
          params={this.props.params}
          getStatusIcon={getStatusIcon}
          __={__} />
      </div>
    );
  }
}

module.exports = Model;
