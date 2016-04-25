require('./style/index.less');

var React = require('react');
var Main = require('client/components/main/index');
var {Button} = require('client/uskin/index');

var BasicProps = require('client/components/basic_props/index');
var DetailMinitable = require('client/components/detail_minitable/index');
var getStatusIcon = require('client/applications/dashboard/utils/status_icon');

var deleteModal = require('client/components/modal_delete/index');
var createSubnet = require('./pop/create_subnet/index');
var connectRouter = require('./pop/connect_router/index');
var disconnectRouter = require('./pop/disconnect_router/index');
var addInstance = require('./pop/add_instance/index');
var modifySubnet = require('./pop/modify_subnet/index');
var createPort = require('../port/pop/create_port/index');

var config = require('./config.json');
var __ = require('locale/client/dashboard.lang.json');
var router = require('client/utils/router');
var request = require('./request');
var msgEvent = require('client/applications/dashboard/cores/msg_event');
var notify = require('client/applications/dashboard/utils/notify');

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
            return item.router.id ?
              <span>
                <i className="glyphicon icon-router" />
                <a data-type="router" href={'/dashboard/router/' + item.router.id}>
                  {item.router.name || '(' + item.router.id.substr(0, 8) + ')'}
                </a>
              </span> : '';
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
      var table = this.state.config.table;
      table.data = res;
      table.loading = false;

      var detail = this.refs.dashboard.refs.detail;
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
    var rows = data.rows;
    var that = this;
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
      case 'cnt_rter':
        connectRouter(rows[0]);
        break;
      case 'discnt_rter':
        disconnectRouter(rows[0]);
        break;
      case 'add_inst':
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
      case 'mdfy_subnet':
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
            request.deleteSubnets(rows);
            cb(true);
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
    var {rows} = data,
      btnList = refs.btnList,
      btns = btnList.state.btns;

    btnList.setState({
      btns: this.btnListRender(rows, btns)
    });
  }

  btnListRender(rows, btns) {
    var length = rows.length,
      shared = rows[0] ? rows[0].network.shared : null;
    for(let key in btns) {
      switch (key) {
        case 'cnt_rter':
          if (length === 1 && !rows[0].router.id && !shared && rows[0].gateway_ip) {
            btns[key].disabled = false;
          } else {
            btns[key].disabled = true;
          }
          break;
        case 'discnt_rter':
          if (length === 1 && rows[0].router.id) {
            btns[key].disabled = false;
          } else {
            btns[key].disabled = true;
          }
          break;
        case 'add_inst':
          btns[key].disabled = length === 1 ? false : true;
          break;
        case 'mdfy_subnet':
          btns[key].disabled = (length === 1 && !shared) ? false : true;
          break;
        case 'delete':
          var disableDelete = rows.some((row) => {
            return row.network.shared;
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
          var basicPropsItem = this.getBasicPropsItems(rows[0]),
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
                <Button value={__.add_ + __.port} disabled={rows[0].network.shared} onClick={this.onDetailAction.bind(this, 'description', 'crt_port', rows[0])}/>
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
    var that = this;
    switch(actionType) {
      case 'edit_name':
        var {rawItem, newName} = data;
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
        request.deletePort(data).then(() => {});
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
    var data = [{
      title: __.name,
      content: item.name || '(' + item.id.substring(0, 8) + ')',
      type: item.network.shared ? '' : 'editable'
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
      content: item.gateway_ip
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
    }];

    return data;
  }

  getVirtualInterfaceItems(item) {
    var tableContent = [];
    item.ports.forEach((element, index) => {
      var dataObj = {
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
          } else if (element.device_owner === 'network:router_interface') {
            return (
              <div>
                <i className="glyphicon icon-router"></i>
                <a data-type="router" href={'/dashboard/router/' + element.device_id}>{element.router.name || '(' + element.device_id.substr(0, 8) + ')'}</a>
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
                <i className="glyphicon icon-delete" onClick={_this.onDetailAction.bind(_this, 'description', 'rmv_port', element)} />
              </div>
            );
          } else if (element.device_owner !== 'network:dhcp' && element.device_owner !== 'network:router_interface') {
            return (
              <div>
                <i className="glyphicon icon-delete" onClick={_this.onDetailAction.bind(_this, 'description', 'rmv_port', element)} />
              </div>
            );
          } else {
            return '-';
          }
        })(this)
      };
      tableContent.push(dataObj);
    });

    var tableConfig = {
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
      var path = router.getPathList();
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
    var _config = this.state.config;
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
