require('./style/index.less');

const React = require('react');
const Main = require('client/components/main_paged/index');
const {Button} = require('client/uskin/index');

const BasicProps = require('client/components/basic_props/index');
const DetailMinitable = require('client/components/detail_minitable/index');

const deleteModal = require('client/components/modal_delete/index');
const createRouter = require('./pop/create_router/index');
const publicGateway = require('./pop/enable_public_gateway/index');
const disableGateway = require('./pop/disable_gateway/index');
const relatedSubnet = require('./pop/related_subnet/index');
const detachSubnet = require('./pop/detach_subnet/index');

const config = require('./config.json');
const __ = require('locale/client/admin.lang.json');
const request = require('./request');
const getStatusIcon = require('../../utils/status_icon');
const getErrorMessage = require('client/applications/admin/utils/error_message');
const utils = require('../../utils/utils');

class Model extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      config: config
    };

    ['onInitialize', 'onAction', 'getFloatingIp'].forEach((m) => {
      this[m] = this[m].bind(this);
    });

    this.stores = {
      urls: []
    };
  }

  componentWillMount() {
    let that = this;

    this.state.config.table.column.find((col) => {
      if (col.key === 'floating_ip') {
        col.sortBy = function(item1, item2) {
          let a = that.getFloatingIp(item1),
            b = that.getFloatingIp(item2);
          return utils.ipFormat(a) - utils.ipFormat(b);
        };
      }
    });
    this.tableColRender(this.state.config.table.column);
  }

  getFloatingIp(item) {
    let fip = '';
    if(item.external_gateway_info) {
      item.external_gateway_info.external_fixed_ips.some((ip) => {
        if (ip.ip_address.indexOf(':') < 0) {
          fip = ip.ip_address;
          return true;
        }
        return false;
      });
    }
    return fip;
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
      this.onInitialize(nextProps.params);
    }
  }

  tableColRender(columns) {
    columns.map((column) => {
      switch (column.key) {
        case 'floating_ip':
          column.render = (col, item, i) => {
            let fip = '';
            if(item.external_gateway_info) {
              item.external_gateway_info.external_fixed_ips.some((ip) => {
                if (ip.ip_address.indexOf(':') < 0) {
                  fip = ip.ip_address;
                  return true;
                }
                return false;
              });
            }
            return fip;
          };
          break;
        case 'ext_gw':
          column.render = (col, item, i) => {
            return item.external_gateway_info ?
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
      this.getList();
    }
  }

  getInitializeListData() {
    this.getList();
  }

  getSingle(id) {
    this.clearState();

    let table = this.state.config.table;
    request.getRouterByID(id).then((res) => {
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

  getList() {
    this.clearState();
    let table = this.state.config.table,
      pageLimit = table.limit;

    request.getList(pageLimit).then((res) => {
      table.data = res.list;
      this.setPagination(table, res);
      this.updateTableData(table, res._url);
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

  onClickBtnList(key, refs, data) {
    let rows = data.rows;
    let that = this;
    switch (key) {
      case 'create':
        createRouter(null, (res) => {
          that.refresh({
            refreshList: true,
            refreshDetail: true,
            loadingTable: true,
            loadingDetail: true
          });
        });
        break;
      case 'delete':
        let hasSubnet = rows.some((ele) => ele.subnets.length > 0);
        deleteModal({
          __: __,
          action: 'delete',
          type:'router',
          data: rows,
          disabled: hasSubnet ? true : false,
          tip: hasSubnet ? __.tip_router_has_subnet : null,
          onDelete: function(_data, cb) {
            request.deleteRouters(rows).then((res) => {
              that.refresh({
                refreshList: true,
                refreshDetail: true,
                loadingTable: true,
                loadingDetail: true
              });
              cb(true);
            }).catch((error) => {
              cb(false, getErrorMessage(error));
            });
          }
        });
        break;
      case 'en_gw':
        publicGateway(rows[0], null, (res) => {
          that.refresh({
            refreshList: true,
            refreshDetail: true,
            loadingTable: true,
            loadingDetail: true
          });
        });
        break;
      case 'dis_gw':
        disableGateway(rows[0], null, (res) => {
          that.refresh({
            refreshList: true,
            refreshDetail: true,
            loadingTable: true,
            loadingDetail: true
          });
        });
        break;
      case 'cnt_subnet':
        relatedSubnet(rows[0], null, (res) => {
          that.refresh({
            refreshList: true,
            refreshDetail: true,
            loadingTable: true,
            loadingDetail: true
          });
        });
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
      case 'filtrate':
        delete data.rows;
        this.clearState();
        let table = this.state.config.table;
        request.getFilterList(data).then((res) => {
          table.data = res.router;
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
    for(let key in btns) {
      switch (key) {
        case 'en_gw':
          btns[key].disabled = (rows.length === 1 && !rows[0].external_gateway_info) ? false : true;
          break;
        case 'dis_gw':
          btns[key].disabled = (rows.length === 1 && rows[0].external_gateway_info) ? false : true;
          break;
        case 'cnt_subnet':
          btns[key].disabled = (rows.length === 1) ? false : true;
          break;
        case 'delete':
          btns[key].disabled = (rows.length > 0) ? false : true;
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
            subnetConfig = this.getDetailTableConfig(rows[0]);
          contents[tabKey] = (
            <div>
              <BasicProps
                title={__.basic + __.properties}
                defaultUnfold={true}
                tabKey={'description'}
                items={basicPropsItem ? basicPropsItem : []}
                rawItem={rows[0]}
                onAction={this.onDetailAction.bind(this)}/>
              <DetailMinitable
                __={__}
                title={__.subnet}
                defaultUnfold={true}
                tableConfig={subnetConfig ? subnetConfig : []}>
                <Button value={__.connect + __.subnet} onClick={this.onDetailAction.bind(this, 'description', 'cnt_subnet', {
                  rawItem: rows[0]
                })}/>
              </DetailMinitable>
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
    let exGateway = item.external_gateway_info;
    let getGatewayState = function() {
      if(exGateway && exGateway.network_name) {
        return __.on + '/' + exGateway.network_name;
      } else if (exGateway) {
        return __.on;
      } else {
        return __.off;
      }
    };

    let fip = '-';
    if (exGateway) {
      exGateway.external_fixed_ips.some((ip) => {
        if (ip.ip_address.indexOf(':') < 0) {
          fip = ip.ip_address;
          return true;
        }
        return false;
      });
    }
    let items = [{
      title: __.name,
      type: 'editable',
      content: item.name || '(' + item.id.substring(0, 8) + ')'
    }, {
      title: __.id,
      content: item.id
    }, {
      title: __.project_id,
      content: item.project_id
    }, {
      title: __.floating_ip,
      content: fip
    }, {
      title: __.ext_gatway,
      content: getGatewayState()
    }, {
      title: __.status,
      content: getStatusIcon(item.status)
    }];

    return items;
  }

  getDetailTableConfig(item) {
    let dataContent = [];
    item.subnets.forEach((element, index) => {
      let dataObj = {
        id: index + 1,
        name: <div>
            <i className="glyphicon icon-subnet" />
            <a data-type="router" href={'/admin/subnet/' + element.id}>{element.name || '(' + element.id.substring(0, 8) + ')'}</a>
          </div>,
        cidr: element.cidr,
        gateway_ip: element.gateway_ip,
        operation: <i className="glyphicon icon-delete" onClick={this.onDetailAction.bind(this, 'description', 'detach_subnet', {
          rawItem: item,
          childItem: element
        })} />
      };
      dataContent.push(dataObj);
    });

    let tableConfig = {
      column: [{
        title: __.subnet_name,
        key: 'name',
        dataIndex: 'name'
      }, {
        title: __.cidr,
        key: 'cidr',
        dataIndex: 'cidr'
      }, {
        title: __.gateway + __.ip,
        key: 'gateway_ip',
        dataIndex: 'gateway_ip'
      }, {
        title: __.operation,
        key: 'operation',
        dataIndex: 'operation'
      }],
      data: dataContent,
      dataKey: 'id',
      hover: true
    };

    return tableConfig;
  }

  getVpnService(item) {
    let dataContent = [];
    item.vpnservices.forEach((vpnService, index) => {
      let dataObj = {
        id: index + 1,
        name: vpnService.name || '(' + vpnService.id.substring(0, 8) + ')',
        subnet: vpnService.subnet.cidr,
        operation: <i className="glyphicon icon-delete" onClick={this.onDetailAction.bind(this, 'ipsec', 'delete_vpn_service', {
          rawItem: item,
          childItem: vpnService
        })} />
      };
      dataContent.push(dataObj);
    });
    let tableConfig = {
      column: [{
        title: __.vpn_service,
        key: 'name',
        dataIndex: 'name'
      }, {
        title: __.subnet,
        key: 'subnet',
        dataIndex: 'subnet'
      }, {
        title: __.operation,
        key: 'operation',
        dataIndex: 'operation'
      }],
      data: dataContent,
      dataKey: 'id',
      hover: true
    };
    return tableConfig;
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
        let {rawItem, newName} = data;
        request.editRouterName(rawItem, newName).then((res) => {
          this.refresh({
            refreshList: true,
            refreshDetail: true,
            loadingTable: true,
            loadingDetail: true
          });
        });
        break;
      case 'cnt_subnet':
        relatedSubnet(data.rawItem, null, () => {
          this.refresh({
            refreshList: true,
            refreshDetail: true,
            loadingTable: true,
            loadingDetail: true
          });
        });
        break;
      case 'detach_subnet':
        detachSubnet(data, null, () => {
          this.refresh({
            refreshList: true,
            refreshDetail: true,
            loadingTable: true,
            loadingDetail: true
          });
        });
        break;
      default:
        break;
    }
  }

  render() {
    return (
      <div className="halo-module-router" style={this.props.style}>
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
