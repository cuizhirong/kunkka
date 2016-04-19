require('./style/index.less');

var React = require('react');
var Main = require('client/components/main/index');

var BasicProps = require('client/components/basic_props/index');

var deleteModal = require('client/components/modal_delete/index');
var createPort = require('./pop/create_port/index');
var associateInstance = require('./pop/associate_instance/index');
var detachInstance = require('./pop/detach_instance/index');
var modifySecurityGroup = require('./pop/modify_security_group/index');

var __ = require('locale/client/dashboard.lang.json');
var config = require('./config.json');
var request = require('./request');
var router = require('client/utils/router');
var msgEvent = require('client/applications/dashboard/cores/msg_event');
var notify = require('client/applications/dashboard/utils/notify');
var getStatusIcon = require('../../utils/status_icon');

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
        if (data.resource_type === 'port' || data.resource_type === 'router' || data.resource_type === 'instance' || data.resource_type === 'floatingip') {
          this.refresh({
            detailRefresh: true
          }, false);

          if (data.action === 'delete'
            && data.stage === 'end'
            && data.resource_id === router.getPathList()[2]) {
            router.replaceState('/dashboard/port');
          }
        }
      }
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.style.display === 'none') {
      return false;
    }
    return true;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.style.display !== 'none' && this.props.style.display === 'none') {
      this.getTableData(false);
    }
  }

  tableColRender(columns) {
    columns.map((column) => {
      switch (column.key) {
        case 'subnet':
          column.render = (col, item, i) => {
            var subnets = [];
            item.subnets.map((_subnet, _i) => {
              if(_subnet.id) {
                _i && subnets.push(', ');
                subnets.push(
                  <span key={_subnet.id}>
                    <i className="glyphicon icon-subnet"></i>
                    <a data-type="router" href={'/dashboard/subnet/' + _subnet.id}>
                      {_subnet.name || '(' + _subnet.id.substr(0, 8) + ')'}
                    </a>
                  </span>);
              }
            });
            return item.subnets.length ? <div>{subnets}</div> : '';
          };
          break;
        case 'related_resource':
          column.render = (col, item, i) => {
            if (item.device_owner && item.device_owner.indexOf('compute') > -1) {
              if (item.server && item.server.status === 'SOFT_DELETED') {
                return <div><i className="glyphicon icon-instance"></i>{'(' + item.device_id.substr(0, 8) + ')'}</div>;
              } else if (item.server) {
                return <div><i className="glyphicon icon-instance"></i><a data-type="router" href={'/dashboard/instance/' + item.device_id}>{item.server.name}</a></div>;
              }
            } else if (item.device_owner === 'network:router_interface') {
              return <div><i className="glyphicon icon-router"></i><a data-type="router" href={'/dashboard/router/' + item.device_id}>{item.router.name || '(' + item.router.id.substr(0, 8) + ')'}</a></div>;
            } else {
              return <div>{__[item.device_owner]}</div>;
            }
          };
          break;
        case 'restrict':
          column.render = (col, item, i) => {
            return item.port_security_enabled ?
              <span className="label-active">{__.on}</span> : <span className="label-down">{__.off}</span>;
          };
          break;
        case 'ip_adrs':
          column.render = (col, item, i) => {
            return <span>{
              item.fixed_ips.map((_item, _i) =>
                <span key={_i}>{(_i > 0 ? ', ' : '') + _item.ip_address}</span>
              )
            }</span>;
          };
          break;
        case 'floating_ip':
          column.render = (col, item, i) => {
            return item.floatingip.id ?
              <div>
                <i className="glyphicon icon-floating-ip" />
                <a data-type="router" href={'/dashboard/floating-ip/' + item.floatingip.id}>
                  {item.floatingip.floating_ip_address}
                </a>
              </div> : '';
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
    var rows = data.rows,
      that = this;

    switch (key) {
      case 'delete':
        deleteModal({
          __: __,
          action: 'delete',
          type:'port',
          data: rows,
          onDelete: function(_data, cb) {
            request.deletePorts(rows).then((res) => {
              cb(true);
            });
          }
        });
        break;
      case 'create':
        createPort();
        break;
      case 'assc_instance':
        associateInstance(rows[0], null, () => {
          notify({
            resource_type: 'instance',
            action: 'associate',
            stage: 'end',
            resource_id: rows[0].id
          });
          that.refresh(null, true);
        });
        break;
      case 'detach_instance':
        detachInstance(rows[0], null, () => {
          notify({
            resource_type: 'instance',
            action: 'detach',
            stage: 'end',
            resource_id: rows[0].id
          });
          that.refresh(null, true);
        });
        break;
      case 'modify':
        modifySecurityGroup(rows[0], null, () => {
          notify({
            resource_type: 'security_group',
            action: 'modify',
            stage: 'end',
            resource_id: rows[0].id
          });
          this.refresh(null, true);
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
    var len = rows.length,
      device = rows[0] ? rows[0].device_owner : null;

    for(let key in btns) {
      switch (key) {
        case 'assc_instance':
          btns[key].disabled = (len === 1 && !device) ? false : true;
          break;
        case 'detach_instance':
          btns[key].disabled = (len === 1 && device.indexOf('compute') > -1) ? false : true;
          break;
        case 'modify':
          btns[key].disabled = (len === 1 && (!device || device.indexOf('compute') > -1) && rows[0].port_security_enabled) ? false : true;
          break;
        case 'delete':
          var b = rows.every((m) => {
            if (!m.device_owner || m.device_owner.indexOf('compute') > -1) {
              return true;
            }
            return false;
          });
          btns[key].disabled = (len >= 1 && b) ? false : true;
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
          var basicPropsItem = this.getBasicPropsItems(rows[0]);
          contents[tabKey] = (
            <div>
              <BasicProps
                title = {__.basic + __.properties}
                defaultUnfold = {true}
                tabKey={"description"}
                rawItem={rows[0]}
                onAction={this.onDetailAction.bind(this)}
                items = {basicPropsItem}/>
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
        request.editPortName(rawItem, newName).then((res) => {
          notify({
            resource_type: 'port',
            stage: 'end',
            action: 'modify',
            resource_id: rawItem.id
          });
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
    var items = [{
      title: __.name,
      content: item.name || '(' + item.id.substring(0, 8) + ')',
      type: 'editable'
    }, {
      title: 'ID',
      content: item.id
    }, {
      title: __.associate_gl + __.resource,
      content: (function() {
        if (item.device_owner && item.device_owner.indexOf('compute') > -1) {
          if (item.server && item.server.status === 'SOFT_DELETED') {
            return <div><i className="glyphicon icon-instance"></i>{'(' + item.device_id.substr(0, 8) + ')'}</div>;
          } else if (item.server) {
            return <div><i className="glyphicon icon-instance"></i><a data-type="router" href={'/dashboard/instance/' + item.device_id}>{item.server.name}</a></div>;
          }
        } else if (item.device_owner === 'network:router_interface') {
          return <div><i className="glyphicon icon-router"></i><a data-type="router" href={'/dashboard/router/' + item.device_id}>{item.router.name || '(' + item.router.id.substr(0, 8) + ')'}</a></div>;
        } else {
          return <div>{__[item.device_owner]}</div>;
        }
      })()
    }, {
      title: 'IP' + __.address,
      content:
        <div>{
          item.fixed_ips.map((ritem, i) =>
            <span key={i}>{ritem.ip_address}</span>)
        }</div>
    }, {
      title: 'MAC' + __.address,
      content: item.mac_address
    }, {
      title: __.subnet,
      content: (function() {
        var subnets = [];
        item.subnets.map((_subnet, _i) => {
          if(_subnet.id) {
            _i && subnets.push(', ');
            subnets.push(
              <span key={_subnet.id}>
                <i className="glyphicon icon-subnet"></i>
                <a data-type="router" href={'/dashboard/subnet/' + _subnet.id}>
                  {_subnet.name || '(' + _subnet.id.substr(0, 8) + ')'}
                </a>
              </span>);
          }
        });
        return item.subnets.length ? <div>{subnets}</div> : '-';
      })()
    }, {
      title: __.floating_ip,
      content: item.floatingip.id ?
        <div>
          <i className="glyphicon icon-floating-ip" />
          <a data-type="router" href={'/dashboard/floating-ip/' + item.floatingip.id}>
            {item.floatingip.floating_ip_address}
          </a>
        </div> : '-'
    }, {
      title: __.security + __.group,
      content:
        <div>
        {item.security_groups.length ? item.security_groups.map((ritem, i) =>
          <div key={i}>
            <i className="glyphicon icon-security-group" />
            <a data-type="router" href={'/dashboard/security-group/' + ritem.id}>
              {ritem.name}
            </a>
          </div>
        ) : '-'}
        </div>
    }, {
      title: __.security + __.restrict,
      content: item.port_security_enabled ?
        <span className="label-active">{__.on}</span> : <span className="label-down">{__.off}</span>
    }, {
      title: __.status,
      content: getStatusIcon(item.status)
    }, {
      title: __.create + __.time,
      type: 'time',
      content: item.created_at
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

  render() {
    return (
      <div className="halo-module-port" style={this.props.style}>
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
