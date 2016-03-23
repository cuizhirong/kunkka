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
var __ = require('i18n/client/lang.json');
var router = require('client/dashboard/cores/router');
var request = require('./request');
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
      if (data.resource_type === 'network' || data.resource_type === 'subnet') {
        this.refresh({
          detailRefresh: true
        }, false);

        if (data.action === 'delete'
          && data.stage === 'end'
          && data.resource_id === router.getPathList()[2]) {
          router.replaceState('/project/network');
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
    if (nextProps.style.display !== 'none' && this.props.style.display === 'none') {
      this.getTableData(false);
    }
  }

  tableColRender(columns) {
    columns.map((column) => {
      switch (column.key) {
        case 'subnet':
          column.render = (col, item, i) => {
            var listener = (subnetID) => {
              router.pushState('/project/subnet/' + subnetID);
            };

            var subnetRender = [];
            item.subnets.map((_item, _i) => {
              if (typeof _item === 'object') {
                _i && subnetRender.push(', ');
                subnetRender.push(<i key={'icon' + _i}className="glyphicon icon-subnet" />);
                subnetRender.push(
                  <a key={'subnetName' + _i} onClick={listener.bind(null, _item.id)}>
                    {_item.name ? _item.name : _item.cidr}
                  </a>
                );
              }
            });

            return item.subnets.length ? <div>{subnetRender.map((_item) => _item)}</div> : '';
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
        createNetwork(function() {});
        break;
      case 'crt_subnet':
        createSubnet(rows[0], function() {});
        break;
      case 'delete':
        deleteModal({
          action: 'delete',
          type: 'prv_network',
          data: rows,
          iconType: 'network',
          onDelete: function(_data, cb) {
            request.deleteNetworks(rows).then((res) => {
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
        case 'crt_subnet':
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
                onAction={this.onDetailAction.bind(this)} />
              <DetailMinitable
                title={__.subnet}
                defaultUnfold={true}
                tableConfig={subnetConfig ? subnetConfig : []}>
                <Button value={__.create + __.subnet} onClick={this.onDetailAction.bind(this, 'description', 'crt_subnet', {
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
        request.editNetworkName(rawItem, newName).then((res) => {});
        break;
      case 'crt_subnet':
        createSubnet(data.rawItem, function() {});
        break;
      case 'rmv_subnet':
        deleteModal({
          action: 'terminate',
          type: 'subnet',
          data: [data.childItem],
          onDelete: function(_data, cb) {
            request.deleteSubnet(data.childItem).then(() => {
              cb(true);
            });
          }
        });
        break;
      default:
        break;
    }
  }

  getBasicPropsItems(item) {
    var items = [{
      title: __.name,
      content: item.name,
      type: 'editable'
    }, {
      title: __.id,
      content: item.id
    }, {
      title: __.status,
      type: 'status',
      status: item.status,
      content: __[item.status.toLowerCase()]
    }];

    return items;
  }

  getDetailTableConfig(item) {
    var dataContent = [];
    item.subnets.forEach((element, index) => {
      var dataObj = {
        id: index + 1,
        name: <a data-type="router" href={'/project/subnet/' + element.id}>{element.name || '(' + element.id.slice(0, 8) + ')'}</a>,
        cidr: element.cidr,
        router: element.router ? element.router.name : '',
        operation: <i className="glyphicon icon-delete" onClick={this.onDetailAction.bind(this, 'description', 'rmv_subnet', {
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
          params={this.props.params} />
      </div>
    );
  }

}

module.exports = Model;
