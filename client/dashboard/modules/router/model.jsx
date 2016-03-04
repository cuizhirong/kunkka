require('./style/index.less');

var React = require('react');
var Main = require('client/components/main/index');
var {Button} = require('client/uskin/index');

var BasicProps = require('client/components/basic_props/index');
var DetailMinitable = require('client/components/detail_minitable/index');

var deleteModal = require('client/components/modal_delete/index');
var createRouter = require('./pop/create_router/index');
var publicGateway = require('./pop/enable_public_gateway/index');
var disableGateway = require('./pop/disable_gateway/index');
var associateFip = require('./pop/associate_fip/index');
var dissociateFip = require('./pop/dissociate_fip/index');
var relatedSubnet = require('./pop/related_subnet/index');

var config = require('./config.json');
var __ = require('i18n/client/lang.json');
var request = require('./request');
var router = require('client/dashboard/cores/router');

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
        case 'floating_ip':
          column.render = (col, item, i) => {
            if(item.floatingip) {
              return (
                  <a data-type="router" href={'/project/floating-ip/' + item.floatingip.id}>
                    {item.floatingip.floating_ip_address}
                  </a>
              );
            } else {
              return '';
            }
          };
          break;
        case 'ext_gw':
          column.render = (col, item, i) => {
            if(item.external_gateway_info) {
              return item.external_gateway_info.enable_snat ? __.on : __.off;
            } else {
              return '';
            }
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

  getTableData(forceUpdate) {
    request.getList((res) => {
      var table = this.state.config.table;
      table.data = res.routers;
      table.loading = false;

      this.setState({
        config: config
      });

      var detail = this.refs.dashboard.refs.detail;
      if (detail.state.loading) {
        detail.setState({
          loading: false
        });
      }
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
    console.log(rows);
    switch (key) {
      case 'create':
        createRouter('1212', function(){});
        break;
      case 'refresh':
        this.refresh({
          tableLoading: true,
          detailLoading: true
        }, true);
        break;
      case 'delete':
        deleteModal({
          action: 'delete',
          type:'router',
          data: rows,
          onDelete: function(_data, cb) {
            cb(true);
          }
        });
        break;
      case 'en_gw':
        publicGateway(data, function() {});
        break;
      case 'dis_gw':
        disableGateway(data, function() {});
        break;
      case 'assc_fip':
        associateFip({
          name: rows[0].name
        }, function() {});
        break;
      case 'dis_fip':
        dissociateFip({
          router: rows[0].name,
          floating_ip: 'in'
        }, function() {});
        break;
      case 'cnt_subnet':
        relatedSubnet({
          router: rows[0].name
        }, function() {});
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
        case 'assc_fip':
          btns[key].disabled = (rows.length === 1 && !rows[0].floatingip.id) ? false : true;
          break;
        case 'dis_fip':
          btns[key].disabled = (rows.length === 1 && rows[0].floatingip.id) ? false : true;
          break;
        case 'cnt_subnet':
          btns[key].disabled = (rows.length === 1) ? false : true;
          break;
        case 'delete':
          btns[key].disabled = (rows.length === 1) ? false : true;
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
    var syncUpdate = true;

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
            subnetConfig = this.getDetailTableConfig(rows[0].subnets);
          contents[tabKey] = (
            <div>
              <BasicProps
                title={__.basic + __.properties}
                defaultUnfold={true}
                items={basicPropsItem ? basicPropsItem : []} />
              <DetailMinitable
                title={__.subnet}
                defaultUnfold={true}
                tableConfig={subnetConfig ? subnetConfig : []}>
                <Button value={__.related + __.subnet}/>
              </DetailMinitable>
            </div>
          );
        }
        break;
      default:
        break;
    }

    if (syncUpdate) {
      detail.setState({
        contents: contents
      });
    }
  }

  getBasicPropsItems(item) {
    var getGatewayState = function() {
      if(item.external_gateway_info) {
        return item.external_gateway_info.enable_snat ? __.on : __.off;
      } else {
        return '';
      }
    };
    var routerListener = (id, e) => {
      e.preventDefault();
      router.pushState('/project/floating-ip/' + id);
    };
    var items = [{
      title: __.name,
      content: item.name
    }, {
      title: __.id,
      content: item.id
    }, {
      title: __.floating_ip,
      content: item.floatingip ?
        <a onClick={routerListener.bind(null, item.floatingip.id)}>
          {item.floatingip.floating_ip_address}
        </a> : ''
    }, {
      title: __.ext_gatway,
      content: getGatewayState()
    }, {
      title: __.status,
      type: 'status',
      status: item.status,
      content: __[item.status.toLowerCase()]
    }, {
      title: __.create + __.time,
      content: ''
    }];

    return items;
  }

  getDetailTableConfig(item) {
    var dataContent = [];
    item.forEach((element, index) => {
      var dataObj = {
        id: index + 1,
        name: <div>
            <i className="glyphicon icon-subnet" />
            <a data-type="router" href={'/project/subnet/' + element.id}>{element.name}</a>
          </div>,
        cidr: element.cidr,
        gateway_ip: element.gateway_ip,
        operation: <i className="glyphicon icon-delete" />
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

  refresh(data) {
    var path = router.getPathList();
    if (!path[2]) {
      if (data && data.tableLoading) {
        this.loadingTable();
      }
      this.refs.dashboard.clearState();
    } else {
      if (data && data.detailLoading) {
        this.refs.dashboard.refs.detail.loading();
      }
    }

    this.getTableData();
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
      <div className="halo-module-router" style={this.props.style}>
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
