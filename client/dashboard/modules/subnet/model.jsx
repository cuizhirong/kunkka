require('./style/index.less');

var React = require('react');
var Main = require('client/components/main/index');
var {Button} = require('client/uskin/index');

var BasicProps = require('client/components/basic_props/index');
var DetailMinitable = require('client/components/detail_minitable/index');
var getStatusIcon = require('client/dashboard/utils/status_icon');

var deleteModal = require('client/components/modal_delete/index');

var config = require('./config.json');
var __ = require('i18n/client/lang.json');
var router = require('client/dashboard/cores/router');
var createSubnet = require('./pop/create_subnet/index');
var request = require('./request');
var connectRouter = require('./pop/connect_router/index');
var disconnectRouter = require('./pop/disconnect_router/index');
var addInstance = require('./pop/add_instance/index');
var modifySubnet = require('./pop/modify_subnet/index');
var msgEvent = require('client/dashboard/cores/msg_event');

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
      if (data.resource_type === 'subnet') {
        this.refresh(null, false);
        if (data.action === 'delete' && data.stage === 'end' && data.resource_id === router.getPathList()[2]) {
          router.replaceState('/project/subnet');
        }
      }
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.style.display === 'none' && this.props.style.display === 'none') {
      return false;
    }
    return true;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.style.display !== 'none') {
      this.getTableData(false);
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
                <a data-type="router" href={'/project/network/' + item.network.id}>
                  {item.network.name}
                </a>
              </span> : '';
          };
          break;
        case 'assc_router':
          column.render = (col, item, i) => {
            return item.router.id ?
              <span>
                <i className="glyphicon icon-router" />
                <a data-type="router" href={'/project/router/' + item.router.id}>
                  {item.router.name}
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
        default:
          break;
      }
    });
  }

  onInitialize(params) {
    this.getTableData(false);
  }

  getTableData(forceUpdate, detailRefresh) {
    request.getList((res) => {
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
    }, forceUpdate);
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
      case 'refresh':
        this.refresh({
          tableLoading: true,
          detailLoading: true,
          clearState: true,
          detailRefresh: true
        }, true);
        break;
      case 'create':
        createSubnet(function() {});
        break;
      case 'cnt_rter':
        connectRouter(rows[0], function() {});
        break;
      case 'discnt_rter':
        disconnectRouter(rows[0], function() {});
        break;
      case 'add_inst':
        addInstance(rows[0], function() {});
        break;
      case 'mdfy_subnet':
        modifySubnet(rows[0], function() {});
        break;
      case 'delete':
        deleteModal({
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
    for(let key in btns) {
      switch (key) {
        case 'cnt_rter':
          if (rows.length === 1 && !rows[0].router.id) {
            btns[key].disabled = false;
          } else {
            btns[key].disabled = true;
          }
          break;
        case 'discnt_rter':
          if (rows.length === 1 && rows[0].router.id) {
            btns[key].disabled = false;
          } else {
            btns[key].disabled = true;
          }
          break;
        case 'add_inst':
          btns[key].disabled = (rows.length === 1) ? false : true;
          break;
        case 'mdfy_subnet':
          btns[key].disabled = (rows.length === 1) ? false : true;
          break;
        case 'delete':
          btns[key].disabled = (rows.length >= 1) ? false : true;
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
            virtualInterfaceItem = this.getVirtualInterfaceItems(rows[0].ports);
          contents[tabKey] = (
            <div>
              <BasicProps title={__.basic + __.properties}
                defaultUnfold={true}
                tabKey={"description"}
                rawItem={rows[0]}
                onAction={this.onDetailAction.bind(this)}
                items={basicPropsItem ? basicPropsItem : []}/>
              <DetailMinitable
                title={__.port}
                defaultUnfold={true}
                tableConfig={virtualInterfaceItem ? virtualInterfaceItem : []}>
                <Button value={__.add_ + __.port}/>
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
    switch(actionType) {
      case 'edit_name':
        var {rawItem, newName} = data;
        request.editSubnetName(rawItem, newName).then((res) => {
          this.refresh({
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
      content: item.name,
      type: 'editable'
    }, {
      title: __.id,
      content: item.id
    }, {
      title: __.prv_network,
      content: item.network ?
        <span>
          <i className="glyphicon icon-network" />
          <a data-type="router" href={'/project/network/' + item.network.id}>
            {item.network.name}
          </a>
        </span> : null
    }, {
      title: __.associate + __.router,
      content: item.router.id ?
        <span>
          <i className="glyphicon icon-router" />
          <a data-type="router" href={'/project/router/' + item.router.id}>
            {item.router.name}
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
    }];

    return data;
  }

  getVirtualInterfaceItems(item) {
    var tableContent = [];
    item.forEach((element, index) => {
      var dataObj = {
        id: index + 1,
        name: <a data-type="router" href={'/project/port/' + element.id}>{element.name ? element.name : '(' + element.id.slice(0, 8) + ')'}</a>,
        ip_address: element.fixed_ips[0].ip_address,
        mac_address: element.mac_address,
        instance: element.instance ?
          <div>
            <i className="glyphicon icon-instance"/>
            <a data-type="router" href={'/project/instance/' + element.instance.id}>{element.instance.name}</a>
          </div>
          : null,
        status: getStatusIcon(element.status),
        operation: <div>
            <i className="glyphicon icon-associate action"/>
            <i className="glyphicon icon-delete" />
          </div>
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
        title: __.related + __.instance,
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
          params={this.props.params} />
      </div>
    );
  }
}

module.exports = Model;
