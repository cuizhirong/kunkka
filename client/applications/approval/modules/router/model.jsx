require('./style/index.less');

const React = require('react');
const Main = require('client/components/main/index');
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

const request = require('./request');
const router = require('client/utils/router');
const msgEvent = require('client/applications/approval/cores/msg_event');
const getStatusIcon = require('../../utils/status_icon');
const getErrorMessage = require('client/applications/approval/utils/error_message');

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
        if (data.resource_type === 'router') {
          this.refresh({
            detailRefresh: true
          }, false);

          if (data.action === 'delete'
            && data.stage === 'end'
            && data.resource_id === router.getPathList()[2]) {
            router.replaceState('/approval/router');
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
      contents: contents
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
            <a data-type="router" href={'/approval/subnet/' + element.id}>{element.name || '(' + element.id.substring(0, 8) + ')'}</a>
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
