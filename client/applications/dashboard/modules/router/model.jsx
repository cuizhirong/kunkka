require('./style/index.less');

var React = require('react');
var Main = require('client/components/main/index');
var {Button, Tip} = require('client/uskin/index');

var BasicProps = require('client/components/basic_props/index');
var DetailMinitable = require('client/components/detail_minitable/index');
var portforwarding = require('./detail/port_forwarding');
var IpsecTable = require('./detail/ipsec_table/index');

var deleteModal = require('client/components/modal_delete/index');
var createRouter = require('./pop/create_router/index');
var publicGateway = require('./pop/enable_public_gateway/index');
var disableGateway = require('./pop/disable_gateway/index');
var relatedSubnet = require('./pop/related_subnet/index');
var detachSubnet = require('./pop/detach_subnet/index');
var createVpnService = require('./pop/create_vpn_service/index');
var createTunnel = require('./pop/create_tunnel/index');
var editTunnel = require('./pop/edit_tunnel/index');
var createPortForwarding = require('./pop/create_portforwarding/index');

var config = require('./config.json');
var __ = require('locale/client/dashboard.lang.json');
var request = require('./request');
var router = require('client/utils/router');
var msgEvent = require('client/applications/dashboard/cores/msg_event');
var getStatusIcon = require('../../utils/status_icon');
var getErrorMessage = require('client/applications/dashboard/utils/error_message');

class Model extends React.Component {

  constructor(props) {
    super(props);

    let tabs = config.table.detail.tabs;
    let enableIpsec = HALO.settings.enable_ipsec;
    let enablePortFrwd = HALO.settings.enable_router_portforwarding;
    if (enablePortFrwd) {
      tabs.push({
        name: ['port_forwarding'],
        key: 'port_forwarding'
      });
    }
    if (enableIpsec) {
      tabs.push({
        name: ['ipsec', 'tunnel'],
        key: 'ipsec'
      });
    }

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
        if (data.resource_type === 'router') {
          this.refresh({
            detailRefresh: true
          }, false);

          if (data.action === 'delete'
            && data.stage === 'end'
            && data.resource_id === router.getPathList()[2]) {
            router.replaceState('/dashboard/router');
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
        case 'floating_ip':
          column.render = (col, item, i) => {
            var fip = '';
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
    switch (key) {
      case 'create':
        createRouter();
        break;
      case 'refresh':
        this.refresh({
          tableLoading: true,
          detailLoading: true,
          clearState: true,
          detailRefresh: true
        }, true);
        break;
      case 'delete':
        var hasSubnet = rows.some((ele) => ele.subnets.length > 0);
        deleteModal({
          __: __,
          action: 'delete',
          type:'router',
          data: rows,
          disabled: hasSubnet ? true : false,
          tip: hasSubnet ? __.tip_router_has_subnet : null,
          onDelete: function(_data, cb) {
            request.deleteRouters(rows).then((res) => {
              cb(true);
            }).catch((error) => {
              cb(false, getErrorMessage(error));
            });
          }
        });
        break;
      case 'en_gw':
        publicGateway(rows[0]);
        break;
      case 'dis_gw':
        disableGateway(rows[0]);
        break;
      case 'cnt_subnet':
        relatedSubnet(rows[0]);
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
      case 'port_forwarding':
        if (isAvailableView(rows)) {
          detail.setState({
            loading: true
          });

          var routerId = rows[0].id;
          request.getPortForwarding(routerId).then((portFrwds) => {
            var tableconfig = portforwarding.getTableConfig(rows[0], portFrwds, this);
            var tipStyle = {
              marginBottom: '10px'
            };

            contents[tabKey] = (
              <DetailMinitable
                __={__}
                title={__.port_forwarding}
                defaultUnfold={true}
                tableConfig={tableconfig} >
                <div style={tipStyle}>
                  <Tip
                    title={__.port_forwarding}
                    content={__.port_forwarding_tip}
                    type="info" />
                </div>
                <div>
                  <Button type="create"
                    value={__.add_ + __.port_forwarding}
                    onClick={this.onDetailAction.bind(this, 'port_forwarding', 'create', {
                      rawItem: rows[0]
                    })} />
                </div>
              </DetailMinitable>
            );

            detail.setState({
              contents: contents,
              loading: false
            });
          }).catch((err) => {
            contents[tabKey] = (
              <div className="no-data-desc">
                <p>{__.view_is_unavailable}</p>
              </div>
            );

            detail.setState({
              contents: contents,
              loading: false
            });
          });
        }
        break;
      case 'ipsec':
        if (isAvailableView) {
          var vpnService = this.getVpnService(rows[0]),
            ipsecItem = this.getIpsecItem(rows[0]);

          contents[tabKey] = (
            <div>
              <IpsecTable
                __={__}
                title={__.tunnel + __.list}
                defaultUnfold={true}
                tableConfig={ipsecItem ? ipsecItem : []}
                onAction={this.onDetailAction.bind(this)}>
                <Button type="create" value={__.create + __.tunnel} onClick={this.onDetailAction.bind(this, 'ipsec', 'cnt_tunnel', {
                  rawItem: rows[0]
                })} />
                <a data-type="router" className="link" href={'/dashboard/ike-policy'}>{__.check + __.policy + __.list}</a>
              </IpsecTable>
              <DetailMinitable
                __={__}
                title={__.vpn_service + __.list}
                defaultUnfold={true}
                tableConfig={vpnService ? vpnService : []} >
                <Button type="create" value={__.create + __.vpn_service} onClick={this.onDetailAction.bind(this, 'ipsec', 'cnt_vpn_service', {
                  rawItem: rows[0]
                })} />
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

  getBasicPropsItems(item) {
    var exGateway = item.external_gateway_info;
    var getGatewayState = function() {
      if(exGateway && exGateway.network_name) {
        return __.on + '/' + exGateway.network_name;
      } else if (exGateway) {
        return __.on;
      } else {
        return __.off;
      }
    };

    var fip = '-';
    if (exGateway) {
      exGateway.external_fixed_ips.some((ip) => {
        if (ip.ip_address.indexOf(':') < 0) {
          fip = ip.ip_address;
          return true;
        }
        return false;
      });
    }
    var items = [{
      title: __.name,
      type: 'editable',
      content: item.name || '(' + item.id.substring(0, 8) + ')'
    }, {
      title: __.id,
      content: item.id
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
    var dataContent = [];
    item.subnets.forEach((element, index) => {
      var dataObj = {
        id: index + 1,
        name: <div>
            <i className="glyphicon icon-subnet" />
            <a data-type="router" href={'/dashboard/subnet/' + element.id}>{element.name || '(' + element.id.substring(0, 8) + ')'}</a>
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

    var tableConfig = {
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

  getIpsecItem(item) {
    var columns = [];
    var columnIke = [{
      title: __.ike_policy + __.name,
      key: 'ipsecpolicy',
      dataIndex: 'name'
    }, {
      title: __.auth_algorithm,
      key: 'auth_algorithm',
      dataIndex: 'auth_algorithm'
    }, {
      title: __.encryption_algorithm,
      key: 'encryption_algorithm',
      dataIndex: 'encryption_algorithm'
    }, {
      title: __.ike_version,
      key: 'ike_version',
      dataIndex: 'ike_version'
    }, {
      title: __.pfs,
      key: 'pfs',
      dataIndex: 'pfs'
    }, {
      title: __.sa_lifetime,
      key: 'sa_lifetime',
      dataIndex: 'sa_lifetime'
    }];
    var columnIpsec = [{
      title: __.ipsec_policy + __.name,
      key: 'ipsecpolicy',
      dataIndex: 'name'
    }, {
      title: __.transform_protocol,
      key: 'transform_protocol',
      dataIndex: 'transform_protocol'
    }, {
      title: __.encapsulation_mode,
      key: 'encapsulation_mode',
      dataIndex: 'encapsulation_mode'
    }, {
      title: __.pfs,
      key: 'pfs',
      dataIndex: 'pfs'
    }, {
      title: __.sa_lifetime,
      key: 'sa_lifetime',
      dataIndex: 'sa_lifetime'
    }];
    var columnTagret = [{
      title: __.target_network,
      key: 'target',
      dataIndex: 'peer_cidr'
    }, {
      title: __.operation,
      key: 'operation',
      dataIndex: 'operation'
    }];
    columns.splice(0, 0, columnIke, columnIpsec, columnTagret);

    var dataContent = [],
      obj = [],
      dataObj;
    item.ipsec_site_connections.forEach((element, i) => {
      obj = [];
      element.peer_cidrs.forEach((peerCidr, index) => {
        dataObj = {
          id: index + peerCidr,
          peer_cidr: peerCidr,
          operation: <i className="glyphicon icon-delete" onClick={this.onDetailAction.bind(this, 'ipsec', 'delete_cidr', {
            rawItem: element,
            index: index
          })} />
        };
        obj.push(dataObj);
      });

      dataContent.push(obj);
    });
    var tableConfig = {
      columns: columns,
      data: item.ipsec_site_connections,
      dataContents: dataContent,
      dataKey: 'id',
      hover: true
    };
    return tableConfig;
  }

  getVpnService(item) {
    var dataContent = [];
    item.vpnservices.forEach((vpnService, index) => {
      var dataObj = {
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
    var tableConfig = {
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

  onDetailAction(tabKey, actionType, data) {
    switch(tabKey) {
      case 'description':
        this.onDescriptionAction(actionType, data);
        break;
      case 'port_forwarding':
        this.onPortForwardingAction(actionType, data);
        break;
      case 'ipsec':
        this.onIpsecAction(actionType, data);
        break;
      default:
        break;
    }
  }

  onDescriptionAction(actionType, data) {
    switch(actionType) {
      case 'edit_name':
        var {rawItem, newName} = data;
        request.editRouterName(rawItem, newName).then((res) => {});
        break;
      case 'cnt_subnet':
        relatedSubnet(data.rawItem);
        break;
      case 'detach_subnet':
        detachSubnet(data);
        break;
      default:
        break;
    }
  }

  onPortForwardingAction(actionType, data) {
    switch(actionType) {
      case 'create':
        createPortForwarding(data.rawItem, () => {
          this.refresh({
            detailRefresh: true
          }, true);
        });
        break;
      case 'delete':
        let routerId = data.router.id;
        let portData = {
          id: data.portFrwd.id
        };
        request.deletePortForwarding(routerId, portData).then((res) => {
          this.refresh({
            detailRefresh: true
          }, true);
        });
        break;
      default:
        break;
    }
  }

  onIpsecAction(actionType, data) {
    var that = this;
    switch (actionType) {
      case 'cnt_tunnel':
        createTunnel(data.rawItem, null, () => {
          that.refresh({
            detailRefresh: true
          }, true);
        });
        break;
      case 'cnt_vpn_service':
        createVpnService(data.rawItem, null, () => {
          that.refresh({
            clearState: true,
            detailRefresh: true
          }, true);
        });
        break;
      case 'delete_vpn_service':
        request.deleteVpnService(data.childItem.id).then(res => {
          that.refresh({
            clearState: true,
            detailRefresh: true
          }, true);
        });
        break;
      case 'check':
        let _data = {
          ipsec_site_connection: {
            admin_state_up: data.isOpen
          }
        };
        request.updateIpsecConnection(data.id, _data).then((res) => {
          that.refresh({
            detailRefresh: true
          }, true);
        });
        break;
      case 'delete_cidr':
        data.rawItem.peer_cidrs.splice(data.index, 1);
        var peerCidrs = {
          ipsec_site_connection: {
            peer_cidrs: data.rawItem.peer_cidrs
          }
        };
        request.updateIpsecConnection(data.rawItem.id, peerCidrs).then(res => {
          that.refresh({
            detailRefresh: true
          }, true);
        });
        break;
      case 'deleteIpsec':
        deleteModal({
          __: __,
          action: 'delete',
          type: 'tunnel',
          data: [data.rawItem],
          onDelete: function(_data1, cb) {
            request.deleteIpsecConnection(data.id).then((res) => {
              cb(true);
              that.refresh({
                detailRefresh: true
              }, true);
            }).catch((error) => {
              cb(false, getErrorMessage(error));
            });
          }
        });
        break;
      case 'editIpsec':
        editTunnel(data.rawItem, null, () => {
          this.refresh({
            clearState: true,
            detailRefresh: true
          }, true);
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
