require('./style/index.less');

var React = require('react');
var Main = require('client/components/main/index');
var {Button} = require('client/uskin/index');

var BasicProps = require('client/components/basic_props/index');
var DetailMinitable = require('client/components/detail_minitable/index');

var deleteModal = require('client/components/modal_delete/index');
var createNetwork = require('./pop/create_network/index');
var createSubnet = require('../subnet/pop/create_subnet/index');

var config = require('./config.json');
var __ = require('locale/client/dashboard.lang.json');
var router = require('client/utils/router');
var request = require('./request');
var msgEvent = require('client/applications/dashboard/cores/msg_event');
var notify = require('client/applications/dashboard/utils/notify');
var getStatusIcon = require('../../utils/status_icon');
var getErrorMessage = require('client/applications/dashboard/utils/error_message');

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
        if (data.resource_type === 'network' || data.resource_type === 'subnet') {
          this.refresh({
            detailRefresh: true
          }, false);

          if (data.action === 'delete'
            && data.stage === 'end'
            && data.resource_id === router.getPathList()[2]) {
            router.replaceState('/dashboard/network');
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
        case 'subnet':
          column.render = (col, item, i) => {
            var listener = (subnetID) => {
              router.pushState('/dashboard/subnet/' + subnetID);
            };

            var subnetRender = [];
            item.subnets.map((_item, _i) => {
              if (typeof _item === 'object') {
                _i && subnetRender.push(', ');
                subnetRender.push(<i key={'icon' + _i}className="glyphicon icon-subnet" />);
                subnetRender.push(
                  <a key={'subnetName' + _i} onClick={listener.bind(null, _item.id)}>
                    {_item.name ? _item.name : '(' + _item.id.substr(0, 8) + ')'}
                  </a>
                );
              }
            });

            return item.subnets.length ? <div>{subnetRender.map((_item) => _item)}</div> : '';
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
    switch (key) {
      case 'create':
        createNetwork();
        break;
      case 'crt_subnet':
        createSubnet(rows[0]);
        break;
      case 'delete':
        deleteModal({
          __: __,
          action: 'delete',
          type: 'prv_network',
          data: rows,
          iconType: 'network',
          onDelete: function(_data, cb) {
            request.deleteNetworks(rows).then((res) => {
              cb(true);
            }).catch((error) => {
              cb(false, getErrorMessage(error));
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
    var length = rows.length;

    for(let key in btns) {
      switch (key) {
        case 'crt_subnet':
          btns[key].disabled = (length === 1 && !rows[0].shared && !rows[0]['router:external']) ? false : true;
          break;
        case 'delete':
          var disableDelete = rows.some((row) => {
            return row.shared || row['router:external'];
          });
          btns[key].disabled = (length > 0 && !disableDelete) ? false : true;
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
                onAction={this.onDetailAction.bind(this)} />
              <DetailMinitable
                __={__}
                title={__.subnet}
                defaultUnfold={true}
                tableConfig={subnetConfig ? subnetConfig : []}>
                <Button value={__.create + __.subnet} disabled={rows[0].shared || rows[0]['router:external']} onClick={this.onDetailAction.bind(this, 'description', 'crt_subnet', {
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
        request.editNetworkName(rawItem, newName).then((res) => {
          notify({
            resource_type: 'network',
            stage: 'end',
            action: 'modify',
            resource_id: rawItem.id
          });
          this.refresh({
            detailRefresh: true
          }, true);
        });
        break;
      case 'crt_subnet':
        createSubnet(data.rawItem);
        break;
      case 'rmv_subnet':
        deleteModal({
          __: __,
          action: 'terminate',
          type: 'subnet',
          data: [data.childItem],
          onDelete: function(_data, cb) {
            request.deleteSubnet(data.childItem).then(() => {
              cb(true);
            }).catch(error => {
              cb(false, getErrorMessage(error));
            });
          }
        });
        break;
      default:
        break;
    }
  }

  getBasicPropsItems(item) {
    var networkType = item['provider:network_type'];
    var items = [{
      title: __.name,
      content: item.name || '(' + item.id.substring(0, 8) + ')',
      type: (item.shared || item['router:external']) ? '' : 'editable'
    }, {
      title: __.id,
      content: item.id
    }, {
      title: __.status,
      content: getStatusIcon(item.status)
    }, {
      title: __.network_type,
      content: networkType
    }, {
      title: __.vlan_id,
      content: networkType === 'vlan' ? item['provider:segmentation_id'] : '-'
    }, {
      title: __.security + __.restrict,
      content: item.port_security_enabled ?
        <span className="label-active">{__.on}</span> : <span className="label-down">{__.off}</span>
    }, {
      title: __.external_network,
      content: item['router:external'] ? __.yes : __.no
    }, {
      title: __.shared,
      content: item.shared ? __.yes : __.no
    }];

    return items;
  }

  getDetailTableConfig(item) {
    var dataContent = [];
    item.subnets.forEach((element, index) => {
      var dataObj = {
        id: index + 1,
        name: <a data-type="router" href={'/dashboard/subnet/' + element.id}>{element.name || '(' + element.id.substring(0, 8) + ')'}</a>,
        cidr: element.cidr,
        router: element.router ?
          <span>
            <i className="glyphicon icon-router"/>
            <a data-type="router" href={'/dashboard/router/' + element.router.id}>{element.router.name || '(' + element.router.id.substr(0, 8) + ')'}</a>
          </span> : '',
        operation: (item.shared || item['router:external']) ? '-' : <i className="glyphicon icon-delete" onClick={this.onDetailAction.bind(this, 'description', 'rmv_subnet', {
          rawItem: item,
          childItem: element
        })} />
      };
      dataContent.push(dataObj);
    });

    var tableConfig = {
      column: [{
        title: __.subnet + __.name,
        key: 'name',
        dataIndex: 'name'
      }, {
        title: __.cidr,
        key: 'cidr',
        dataIndex: 'cidr'
      }, {
        title: __.related + __.router,
        key: 'router',
        dataIndex: 'router'
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

  render() {
    return (
      <div className="halo-module-network" style={this.props.style}>
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
