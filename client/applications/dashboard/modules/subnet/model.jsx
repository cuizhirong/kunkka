require('./style/index.less');

const React = require('react');
const Main = require('client/components/main/index');
const {Button} = require('client/uskin/index');

const BasicProps = require('client/components/basic_props/index');
const DetailMinitable = require('client/components/detail_minitable/index');
const getStatusIcon = require('client/applications/dashboard/utils/status_icon');

const deleteModal = require('client/components/modal_delete/index');
const createSubnet = require('./pop/create_subnet/index');
const connectRouter = require('./pop/connect_router/index');
const disconnectRouter = require('./pop/disconnect_router/index');
const addInstance = require('./pop/add_instance/index');
const modifySubnet = require('./pop/modify_subnet/index');
const createPort = require('../port/pop/create_port/index');

const config = require('./config.json');
const __ = require('locale/client/dashboard.lang.json');
const router = require('client/utils/router');
const request = require('./request');
const msgEvent = require('client/applications/dashboard/cores/msg_event');
const notify = require('client/applications/dashboard/utils/notify');
const getErrorMessage = require('client/applications/dashboard/utils/error_message');

class Model extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      config: config
    };

    ['onInitialize', 'onAction'].forEach((m) => {
      this[m] = this[m].bind(this);
    });
  }

  componentWillMount() {
    this.tableColRender(this.state.config.table.column);

    msgEvent.on('dataChange', (data) => {
      if (this.props.style.display !== 'none') {
        if (data.resource_type === 'subnet' || data.resource_type === 'port' || data.resource_type === 'router') {
          this.refresh({
            detailRefresh: true
          }, false);

          if (data.action === 'delete' && data.stage === 'end' && data.resource_id === router.getPathList()[2]) {
            router.replaceState('/dashboard/subnet');
          }
        }
      }
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.style.display === 'none' && !nextState.config.table.loading) {
      return false;
    }
    return true;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.style.display !== 'none' && this.props.style.display === 'none') {
      if (this.state.config.table.loading) {
        this.loadingTable();
      } else {
        this.getTableData(false);
      }
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
                <a data-type="router" href={'/dashboard/network/' + item.network.id}>
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
                  <a data-type="router" href={'/dashboard/router/' + item.router.id}>
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
    this.getTableData(false);
  }

  getTableData(forceUpdate, detailRefresh) {
    request.getList(forceUpdate).then((res) => {
      let table = this.state.config.table;
      table.data = res;
      table.loading = false;

      let detail = this.refs.dashboard.refs.detail;
      if (detail && detail.state.loading) {
        detail.setState({
          loading: false
        });
      }

      this.setState({
        config: config
      }, () => {
        if (detail && detailRefresh) {
          detail.refresh();
        }
      });
    });
  }

  onAction(field, actionType, refs, data) {
    switch (field) {
      case 'btnList':
        this.onClickBtnList(data.key, refs, data);
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

  onClickBtnList(key, refs, data) {
    let rows = data.rows;
    let that = this;
    switch (key) {
      case 'refresh':
        this.refresh({
          tableLoading: true,
          detailLoading: true,
          clearState: true,
          detailRefresh: true
        }, true);
        break;
      case 'create':
        createSubnet(rows[0]);
        break;
      case 'connect_router':
        connectRouter(rows[0]);
        break;
      case 'disconnect_router':
        disconnectRouter(rows[0]);
        break;
      case 'add_instance':
        addInstance(rows[0], false, null, function() {
          notify({
            resource_type: 'instance',
            action: 'associate',
            stage: 'end',
            resource_id: rows[0].id
          });
          that.refresh({
            detailRefresh: true
          }, true);
        });
        break;
      case 'modify_subnet':
        modifySubnet(rows[0], null, function(res) {
          notify({
            resource_name: rows[0].name,
            stage: 'end',
            action: 'modify',
            resource_type: 'subnet',
            resource_id: rows[0].id
          });
          that.refresh({
            detailRefresh: true
          }, true);
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
                tableConfig={virtualInterfaceItem ? virtualInterfaceItem : []}>
                <Button value={__.add_ + __.port} disabled={rows[0].network['router:external']} onClick={this.onDetailAction.bind(this, 'description', 'crt_port', rows[0])}/>
              </DetailMinitable>
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
          notify({
            resource_type: 'subnet',
            stage: 'end',
            action: 'modify',
            resource_id: rawItem.id
          });
          this.refresh({
            detailRefresh: true
          }, true);
        });
        break;
      case 'crt_port':
        createPort(data);
        break;
      case 'rmv_port':
        deleteModal({
          __: __,
          action: 'terminate',
          type: 'port',
          data: [data.rawItem],
          onDelete: function(_data, cb) {
            request.deletePort(data.rawItem).then(() => {
              cb(true);
            }).catch(error => {
              cb(false, getErrorMessage(error));
            });
          }
        });
        break;
      case 'connect_inst':
        addInstance(data.rawItem, true, null, function() {
          notify({
            resource_type: 'instance',
            action: 'associate',
            stage: 'end',
            resource_id: data.rawItem.id
          });
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
          <a data-type="router" href={'/dashboard/network/' + item.network.id}>
            {item.network.name || '(' + item.network.id.substring(0, 8) + ')'}
          </a>
        </span> : null
    }, {
      title: __.associate + __.router,
      content: item.router.id ?
        <span>
          <i className="glyphicon icon-router" />
          <a data-type="router" href={'/dashboard/router/' + item.router.id}>
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
      title: __.shared,
      content: item.network.shared ? __.yes : __.no
    }, {
      title: __.host + __.routes,
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
        name: <a data-type="router" href={'/dashboard/port/' + element.id}>{element.name ? element.name : '(' + element.id.substring(0, 8) + ')'}</a>,
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
                  <a data-type="router" href={'/dashboard/instance/' + element.device_id}>{element.server.name}</a>
                </div>
              );
            }
          } else if (element.device_owner === 'network:ha_router_replicated_interface' && item.router) {
            return (
              <div>
                <i className="glyphicon icon-router"></i>
                <a data-type="router" href={'/dashboard/router/' + element.device_id}>{item.router.name || '(' + element.device_id.substr(0, 8) + ')'}</a>
              </div>
            );
          } else if (element.device_owner && element.device_owner.indexOf('neutron') > -1){
            return (
              <div>
                <i className="glyphicon icon-lb"></i>
                <a data-type="router" href={'/dashboard/loadbalancer/' + element.device_id}>{element.lbs.name || '(' + element.device_id.substr(0, 8) + ')'}</a>
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

  refresh(data, forceUpdate) {
    if (data) {
      let path = router.getPathList();
      if (path[2]) {
        if (data.detailLoading) {
          this.refs.dashboard.refs.detail.loading();
        }
      } else {
        if (data.tableLoading) {
          this.loadingTable();
        }
        if (data.clearState) {
          this.refs.dashboard.clearState();
        }
      }
    }

    this.getTableData(forceUpdate, data ? data.detailRefresh : false);
  }

  loadingTable() {
    let _config = this.state.config;
    _config.table.loading = true;

    this.setState({
      config: _config
    });
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
