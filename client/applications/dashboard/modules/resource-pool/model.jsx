require('./style/index.less');

var React = require('react');
var Main = require('client/components/main/index');

//detail component
var BasicProps = require('client/components/basic_props/index');
var ResourceList = require('./resource_list');

//pop modals
var createPool = require('./pop/create_pool/');
var deleteModal = require('client/components/modal_delete/index');
var updatePoolState = require('./pop/update_pool_state/index');
var addResource = require('./pop/add_resource/index');
var updateResourceState = require('./pop/update_resource_state/index');
var modifyWeight = require('./pop/modify_weight/index');
var createMonitor = require('./pop/create_monitor/index');

var config = require('./config.json');
var router = require('client/utils/router');
var __ = require('locale/client/dashboard.lang.json');
var request = require('./request');
var getStatusIcon = require('../../utils/status_icon');
var notify = require('client/applications/dashboard/utils/notify');
var msgEvent = require('client/applications/dashboard/cores/msg_event');

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
    var columns = this.state.config.table.column;
    this.tableColRender(columns);

    msgEvent.on('dataChange', data => {
      if (this.props.style.display !== 'none') {
        if(data.resource_type === 'pool' || data.resource_type === 'member') {
          this.refresh({
            detailRefresh: true
          }, false);

          if (data.action === 'delete'
            && data.stage === 'end'
            && data.resource_id === router.getPathList()[2]) {
            router.replaceState('/dashboard/resource-pool');
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
    columns.map(column => {
      switch (column.key) {
        case 'name':
          column.render = (col, item, i) => {
            return item.name || '(' + item.id.slice(0, 8) + ')';
          };
          break;
        case 'admin_state':
          column.render = (col, item, i) => {
            return item.admin_state_up ? __.enabled : __.disabled;
          };
          break;
        case 'load_algorithm':
          column.render = (col, item, i) => {
            return __[item.lb_algorithm.toLowerCase()];
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
    request.getList(forceUpdate).then(res => {
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
    var {rows} = data;

    switch(key) {
      case 'create_pool':
        createPool();
        break;
      case 'create_monitor':
        createMonitor();
        break;
      case 'enable_pool':
        updatePoolState(rows[0], null, true);
        break;
      case 'disable_pool':
        updatePoolState(rows[0], null, false);
        break;
      case 'modify_pool':
        createPool(rows[0]);
        break;
      case 'cancel_monitor':
        deleteModal({
          __: __,
          action: 'cancel',
          type: 'health_monitor',
          data: [rows[0].healthmonitor],
          onDelete: function(_data, cb) {
            request.deleteMonitor(rows[0].healthmonitor).then(res => {
              cb(true);
            });
          }
        });
        break;
      case 'delete':
        deleteModal({
          __: __,
          action: 'delete',
          type: 'resource_pool',
          data: rows,
          onDelete: function(_data, cb) {
            request.deletePools(rows).then(res => {
              cb(true);
            });
          }
        });
        break;
      case 'refresh':
        this.refresh({
          tableLoading: true,
          detailLoading: true,
          clearState: true,
          detailRefresh: true
        }, true);
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
        case 'enable_pool':
          btns[key].disabled = !(rows.length === 1 && !rows[0].admin_state_up);
          break;
        case 'disable_pool':
          btns[key].disabled = !(rows.length === 1 && rows[0].admin_state_up);
          break;
        case 'modify_pool':
          btns[key].disabled = rows.length !== 1;
          break;
        case 'cancel_monitor':
          btns[key].disabled = !(rows.length === 1 && rows[0].healthmonitor);
          break;
        case 'delete':
          btns[key].disabled = rows.length > 0 ? false : true;
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
          detail.setState({loading: true});
          request.getRelated(false).then(res => {
            var pool = rows[0];
            request.getMembers(pool.id).then(r => {
              pool.members = r.members;
              r.members.forEach(mem => {
                var servers = res.instance;
                servers.some(s => {
                  if(mem.address === s.fixed_ips[0]) {
                    mem.name = s.name;
                    mem.server_id = s.id;
                  }
                });
              });

              var basicPropsItem = this.getBasicPropsItems(rows[0]),
                resourceListConfig = this.getDetailTableConfig(rows[0]),
                btnConfig = this.getBtnConfig();

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
                  <ResourceList
                    __={__}
                    title={__.resource + __.list}
                    defaultUnfold={true}
                    rawItem={rows[0]}
                    checkboxOnChange={this.checkboxOnChange.bind(this, btnConfig.items[0].items)}
                    onAction={this.onDetailAction.bind(this)}
                    tableConfig={resourceListConfig ? resourceListConfig : []}
                    btnConfig={btnConfig} />
                </div>
              );
              detail.setState({
                contents: contents,
                loading: false
              });
            });
          });
        }
        break;
      default:
        break;
    }
  }

  getBasicPropsItems(item) {
    var items = [{
      title: __.name,
      content: item.name || '(' + item.id.slice(0, 8) + ')',
      type: 'editable'
    }, {
      title: __.id,
      content: item.id
    }, {
      title: __.protocol,
      content: item.protocol
    }, {
      title: __.listener,
      content: item.listener ?
        (item.listener.name || '(' + item.listener.id.slice(0, 8) + ')') : '-'
    }, {
      title: __.lb,
      content: item.loadbalancer ?
        <span>
          <i className="glyphicon icon-lb" />
          <a data-type="router" href={'/dashboard/lb/' + item.loadbalancer.id}>{item.loadbalancer.name || '(' + item.loadbalancer.id.slice(0, 8) + ')'}</a>
        </span>
        : '-'
    }, {
      title: __.load_algorithm,
      content: __[item.lb_algorithm.toLowerCase()]
    }, {
      title: __.health_monitor,
      content: item.healthmonitor_id ?
        __.type + ': ' + item.healthmonitor.type + '  '
        + __.delay + ': ' + item.healthmonitor.delay + '  '
        + __.timeout + ': ' + item.healthmonitor.timeout + '  '
        + __.max_retries + ': ' + item.healthmonitor.max_retries
        : '-'
    }, {
      title: __.desc,
      content: item.description
    }];

    return items;
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

  onDetailAction(tabKey, actionType, data, moreBtnKey) {
    switch (tabKey) {
      case 'description':
        this.onDescriptionAction(actionType, data, moreBtnKey);
        break;
      default:
        break;
    }
  }

  onDescriptionAction(actionType, data, moreBtnKey) {
    switch (actionType) {
      case 'edit_name':
        var {rawItem, newName} = data;
        request.editPoolName(rawItem, newName).then((res) => {
          notify({
            resource_type: 'resource_pool',
            stage: 'end',
            action: 'modify',
            resource_id: rawItem.id
          });
        });
        break;
      case 'add_resource':
        addResource(data.rawItem);
        break;
      case 'resource_ops':
        this.onClickResourceMoreBtn(moreBtnKey, data);
        break;
      default:
        break;
    }
  }

  getDetailTableConfig(pool) {
    var dataContent = [];
    pool.members.forEach(m => {
      var dataObj = {
        name: m.name,
        server_id: m.server_id,
        id: m.id,
        ip_address: m.address,
        protocol_port: m.protocol_port,
        weight: m.weight,
        admin_state: m.admin_state_up
      };
      dataContent.push(dataObj);
    });

    var tableConfig = {
      column: [{
        title: __.name,
        key: 'name',
        dataIndex: 'name',
        render: function(col, item, i) {
          return item.server_id ? <a data-type="router" href={'/dashboard/instance/' + item.server_id}>{item.name || '(' + item.server_id.slice(0, 8) + ')'}</a> : '-';
        }
      }, {
        title: __.ip_address,
        key: 'ip_address',
        dataIndex: 'ip_address'
      }, {
        title: __.protocol_port,
        key: 'protocol_port',
        dataIndex: 'protocol_port'
      }, {
        title: __.weight,
        key: 'weight',
        dataIndex: 'weight'
      }, {
        title: __.admin_state,
        key: 'admin_state',
        render: function(col, item, i) {
          return item.admin_state ? __.enabled : __.disabled;
        }
      }],
      data: dataContent,
      dataKey: 'id',
      checkbox: true,
      hover: true
    };

    return tableConfig;
  }

  checkboxOnChange(btns, rows) {
    btns.map(btn => {
      switch(btn.key) {
        case 'modify_weight':
          btn.disabled = !(rows.length === 1);
          break;
        case 'enable_resource':
          btn.disabled = !(rows.length === 1 && !rows[0].admin_state);
          break;
        case 'disable_resource':
          btn.disabled = !(rows.length === 1 && rows[0].admin_state);
          break;
        case 'delete':
          btn.disabled = !(rows.length === 1);
          break;
        default:
          break;
      }
    });
  }

  getBtnConfig() {
    var btnConfig = {};
    btnConfig.btn = {
      value: __.more,
      iconClass: 'more'
    };
    btnConfig.items = [{
      items: [{
        title: __.modify + __.weight,
        key: 'modify_weight',
        disabled: true
      }, {
        title: __.enable + __.resource,
        key: 'enable_resource',
        disabled: true
      }, {
        title: __.disable + __.resource,
        key: 'disable_resource',
        disabled: true
      }, {
        title: __.delete,
        key: 'delete',
        disabled: true,
        danger: true
      }]
    }];

    return btnConfig;
  }

  onClickResourceMoreBtn(btnKey, data) {
    var {rawItem, rows} = data;
    switch(btnKey) {
      case 'modify_weight':
        modifyWeight(data);
        break;
      case 'enable_resource':
        updateResourceState(data, null, true);
        break;
      case 'disable_resource':
        updateResourceState(data, null, false);
        break;
      case 'delete':
        deleteModal({
          __:__,
          action: 'delete',
          type: 'resource',
          data: rows,
          onDelete: function(_data, cb) {
            request.deleteMember(rawItem.id, rows[0].id).then(res => {
              cb(true);
            });
          }
        });
        break;
      default:
        break;
    }
  }

  render() {
    return (
      <div className="halo-module-resource-pool" style={this.props.style}>
        <Main
          ref="dashboard"
          visible={this.props.style.display === 'none' ? false : true}
          onInitialize={this.onInitialize}
          onAction={this.onAction}
          config={this.state.config}
          params={this.props.params}
          getStatusIcon={getStatusIcon}
          __={__} />
      </div>
    );
  }
}

module.exports = Model;
