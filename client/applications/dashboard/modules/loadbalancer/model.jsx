require('./style/index.less');

const React = require('react');
const Main = require('client/components/main/index');

//detail component
const BasicProps = require('client/components/basic_props/index');

//sub module used in listener tab of detail page
const ListenerList = require('./listener_list');

//pop modals
const deleteModal = require('client/components/modal_delete/index');
const createLb = require('./pop/create_lb/index');
const assocFip = require('./pop/assoc_fip/index');
const dissocFip = require('./pop/dissoc_fip/index');
const createListener = require('./pop/create_listener/index');
const updateListenerState = require('./pop/update_listener_state/index');
const relatedDefaultPool = require('./pop/related_default_pool/index');
const modifySecurity = require('./pop/modify_security/index');

const config = require('./config.json');
const __ = require('locale/client/dashboard.lang.json');
const request = require('./request');
const router = require('client/utils/router');
const getStatusIcon = require('../../utils/status_icon');
const utils = require('../../utils/utils');
const notify = require('client/applications/dashboard/utils/notify');
const msgEvent = require('client/applications/dashboard/cores/msg_event');
const unitConverter = require('client/utils/unit_converter');
const Tip = require('client/components/modal_common/subs/tip/index');

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
    let a = '', b = '';

    this.state.config.table.column.forEach((col) => {
      if (col.key === 'floating_ip') {
        col.sortBy = function(item1, item2) {
          a = item1.floatingip ? item1.floatingip.floating_ip_address : '';
          b = item2.floatingip ? item2.floatingip.floating_ip_address : '';
          return utils.ipFormat(a) - utils.ipFormat(b);
        };
      } else if (col.key === 'ip_address') {
        col.sortBy = function(item1, item2) {
          a = item1.vip_address;
          b = item2.vip_address;
          return utils.ipFormat(a) - utils.ipFormat(b);
        };
      }
    });
    this.tableColRender(this.state.config.table.column);

    msgEvent.on('dataChange', data => {
      if(this.props.style.display !== 'none') {
        if(data.resource_type === 'loadbalancer' || data.resource_type === 'floatingip' || (data.resource_type === 'listener' && data.stage === 'end')) {
          this.refresh({
            detailRefresh: true
          }, true);

          if (data.action === 'delete' && data.stage === 'end' && data.resource_id === router.getPathList()[2]) {
            router.replaceState('/dashboard/loadbalancer');
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
        case 'floating_ip':
          column.render = (col, item, i) => {
            return item.floatingip ? item.floatingip.floating_ip_address : '-';
          };
          break;
        case 'operating_status':
          column.render = (col, item, i) => {
            return __[item.operating_status.toLowerCase()];
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

  onClickBtnList(key, refs, data) {
    let {rows} = data;
    switch(key) {
      case 'create':
        createLb();
        break;
      case 'modify':
        createLb(rows[0]);
        break;
      case 'modify_security':
        modifySecurity(rows[0]);
        break;
      case 'assoc_fip':
        assocFip(rows[0]);
        break;
      case 'dissoc_fip':
        dissocFip(rows[0]);
        break;
      case 'delete':
        deleteModal({
          __: __,
          action: 'delete',
          type: 'lb',
          data: rows,
          disabled: rows[0].listeners.length !== 0 ? true : false,
          children: rows[0].listeners.length !== 0 ?
            <Tip
              __={__}
              tip_type="error"
              label={__.delete_lb_tip} /> : null,
          onDelete: function(_data, cb) {
            request.deleteLb(rows[0]).then(res => {
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
    let {rows} = data,
      btnList = refs.btnList,
      btns = btnList.state.btns;

    btnList.setState({
      btns: this.btnListRender(rows, btns)
    });
  }

  btnListRender(rows, btns) {
    // wheather it has been added to a subnet that is bound to a router that has enabled public gateway
    const hasBoundRouter = rows.length === 1 && rows[0].router.external_gateway_info;

    for(let key in btns) {
      switch (key) {
        case 'modify':
        case 'modify_security':
          btns[key].disabled = rows.length === 1 ? false : true;
          break;
        case 'delete':
          btns[key].disabled = rows.length === 1 ? false : true;
          break;
        case 'assoc_fip':
          btns[key].disabled = hasBoundRouter && !rows[0].floatingip ? false : true;
          break;
        case 'dissoc_fip':
          btns[key].disabled = (rows.length === 1 && rows[0].floatingip) ? false : true;
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

    let update = (newContents, loading) => {
      detail.setState({
        contents: newContents,
        loading: loading
      });
    };

    switch(tabKey) {
      case 'description':
        if (isAvailableView(rows)) {
          update(contents, true);
          request.getConnections(rows[0].id).then(res => {
            let basicPropsItem = this.getBasicPropsItems(rows[0], res);
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
            update(contents);
          });
        }
        break;
      case 'listener':
        if (isAvailableView(rows)) {
          update(contents, true);
          request.getPools().then(pools => {
            request.getRelatedListeners(rows[0].listeners).then(res => {
              contents[tabKey] = (
                <ListenerList
                  title={__.listener + __.list}
                  tabKey={'listener'}
                  rawItem={data.rows[0]}
                  listenerConfigs={this.getListenerConfigs(res, pools)}
                  onAction={this.onDetailAction.bind(this)}
                  defaultUnfold={true} />
              );
              update(contents);
            });
          });
        }
        break;
      default:
        break;
    }

  }

  getBasicPropsItems(item, res) {
    let bytesIn = unitConverter(res.stats.bytes_in),
      bytesOut = unitConverter(res.stats.bytes_out);
    let items = [{
      title: __.name,
      content: item.name || '(' + item.id.slice(0, 8) + ')',
      type: 'editable'
    }, {
      title: __.id,
      content: item.id
    }, {
      title: __.subnet,
      content: item.vip_subnet_id ?
        <span>
          <i className="glyphicon icon-subnet" />
          <a data-type="router" href={'/dashboard/subnet/' + item.vip_subnet_id}>
            {item.subnet || '(' + item.vip_subnet_id.substring(0, 8) + ')'}
          </a>
        </span> : '-'
    }, {
      title: __.ip_address,
      content: item.vip_address
    }, {
      title: __.floating_ip,
      content: item.floatingip ?
        <span>
          <i className="glyphicon icon-floating-ip" />
          <a data-type="router" href={'/dashboard/floating-ip/' + item.floatingip.id}>
            {item.floatingip.floating_ip_address}
          </a>
        </span> : '-'
    }, {
      title: __.status,
      content: getStatusIcon(item.provisioning_status.toLowerCase())
    }, {
      title: __.operation + __.status,
      content: __[item.operating_status.toLowerCase()]
    }, {
      title: __.active_connections,
      content: res.stats.active_connections
    }, {
      title: __.total_connections,
      content: res.stats.total_connections
    }, {
      title: __.bytes_in,
      content: bytesIn.num + ' ' + bytesIn.unit
    }, {
      title: __.bytes_out,
      content: bytesOut.num + ' ' + bytesOut.unit
    }, {
      title: __.desc,
      content: item.description
    }];

    return items;
  }

  onDetailAction(tabKey, actionType, data, moreBtnKey) {
    switch (tabKey) {
      case 'description':
        this.onDescriptionAction(actionType, data);
        break;
      case 'listener':
        this.onListenerAction(actionType, data, moreBtnKey);
        break;
      default:
        break;
    }
  }

  onDescriptionAction(actionType, data) {
    switch (actionType) {
      case 'edit_name':
        let {rawItem, newName} = data;
        request.editLbaasName(rawItem, newName).then((res) => {
          notify({
            resource_type: 'lb',
            stage: 'end',
            action: 'modify',
            resource_id: rawItem.id
          });
        });
        break;
      default:
        break;
    }
  }

  getListenerConfigs(items, pools) {
    let configs = [];
    let wordsToLine = function(data) {
      let value = '';
      data.forEach(ele => {
        value += __[ele];
      });

      return value;
    };
    let getlistenerDropdown = function(item) {
      let dropdown = [{
        items: [{
          title: __.related + __.default + __.resource + __.pool,
          key: 'related',
          disabled: item.default_pool_id
        }, {
          title: __.enable,
          key: 'enable',
          disabled: item.admin_state_up
        }, {
          title: __.disable,
          key: 'disable',
          disabled: !item.admin_state_up
        }, {
          title: __.delete,
          key: 'delete',
          danger: true
        }]
      }];

      return dropdown;
    };

    let getListenerDetail = function(item) {
      //console.log(items)
      let itemDetail = [{
        feild: __.protocol,
        value: item.protocol
      }, {
        feild: __.protocol_port,
        value: item.protocol_port
      }, {
        feild: __.connection_limit,
        value: item.connection_limit === -1 ? __.infinity : item.connection_limit
      }, {
        feild: wordsToLine(['default', 'resource_pool']),
        value: item.default_pool_id && pools.filter(pool => pool.id === item.default_pool_id).length > 0 ? pools.filter(pool => pool.id === item.default_pool_id)[0].name || '(' + pools.filter(pool => pool.id === item.default_pool_id)[0].id.substring(0, 8) + ')' : '-'
      }, {
        feild: __.enabled_state,
        value: item.admin_state_up ? __.enabled : __.disabled
      }];

      return itemDetail;
    };


    items.map((item, i) => {
      configs.push({listener: item});
      configs[i].listenerDropdown = getlistenerDropdown(item);
      configs[i].listenerDetail = getListenerDetail(item);
    });

    return configs;
  }

  //detail listener btn onClick handler
  onListenerAction(actionType, data, moreBtnKey) {
    switch (actionType) {
      case 'create_listener':
        createListener(data.rawItem, null, false);
        break;
      case 'modify_listener':
        createListener(data.childItem, null, true);
        break;
      case 'more_listener_ops':
        this.onClickListenerMoreBtn(moreBtnKey, data);
        break;
      default:
        break;
    }
  }

  onClickListenerMoreBtn(btnKey, data) {
    switch(btnKey) {
      case 'enable':
        updateListenerState(data.childItem, null, true);
        break;
      case 'disable':
        updateListenerState(data.childItem, null, false);
        break;
      case 'delete':
        deleteModal({
          __: __,
          action: 'terminate',
          type: 'listener',
          data: [data.childItem],
          onDelete: function(_data, cb) {
            request.deleteListener(data.childItem).then(() => {
              cb(true);
            });
          }
        });
        break;
      case 'related':
        relatedDefaultPool(data.childItem);
        break;
      default:
        break;
    }
  }

  render() {
    return (
      <div className="halo-module-lb" style={this.props.style}>
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
