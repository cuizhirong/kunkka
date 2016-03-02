require('./style/index.less');

var React = require('react');
var uskin = require('client/uskin/index');
var Button = uskin.Button;
var MainTable = require('client/components/main_table/index');
var BasicProps = require('client/components/basic_props/index');
var DetailMinitable = require('client/components/detail_minitable/index');
var config = require('./config.json');
var __ = require('i18n/client/lang.json');
var request = require('./request');
var Request = require('client/dashboard/cores/request');
var router = require('client/dashboard/cores/router');
var deleteModal = require('client/components/modal_delete/index');

class Model extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      config: config
    };

    this.bindEventList = this.bindEventList.bind(this);
    this.clearTableState = this.clearTableState.bind(this);
    this._eventList = {};
    this._stores = {
      checkedRow: []
    };
  }

  componentWillMount() {
    this.bindEventList();
    this.setTableColRender(config.table.column);
    this.listInstance();
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.style.display === 'none' && this.props.style.display === 'none') {
      return false;
    }
    return true;
  }

  bindEventList() {
    this._eventList = {
      clickBtns: this.clickBtns.bind(this),
      updateBtns: this.updateBtns.bind(this),
      changeSearchInput: this.changeSearchInput,
      clickTableCheckbox: this.clickTableCheckbox.bind(this),
      clickDetailTabs: this.clickDetailTabs.bind(this),
      clickDropdownBtn: this.clickDropdownBtn
    };
  }

  clickDetailTabs(tab, item, callback) {
    switch (tab.key) {
      case 'description':
        if (item.length > 1) {
          callback(
            <div className="no-data-desc">
              <p>{__.view_is_unavailable}</p>
            </div>
          );
        }

        Request.get({
          url: '/api/v1/routers/' + item[0].id
        }).then((res) => {
          var basicPropsItem = this.getBasicPropsItems(res.routers),
            subnetConfig = this.getDetailTableConfig(res.routers.subnets);
          callback(
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
        });
        break;
      default:
        callback(null);
        break;
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

  updateTableData(data) {
    var path = router.getPathList();
    var _conf = this.state.config;
    _conf.table.data = data;

    this.setState({
      config: _conf
    }, () => {
      if (path.length > 2 && data && data.length > 0) {
        router.replaceState(router.getPathName(), null, null, true);
      }
    });
  }

  loadingTable() {
    this.updateTableData(null);
  }

  listInstance() {
    var that = this;

    this.loadingTable();
    request.listRouters().then(function(data) {
      that.updateTableData(data.routers);
    }, function(err) {
      that.updateTableData([]);
      console.debug(err);
    });
  }

  setTableColRender(column) {
    var listener = (id, e) => {
      e.preventDefault();
      router.pushState('/project/floating-ip/' + id);
    };

    column.map((col) => {
      switch (col.key) {
        case 'floating_ip':
          col.render = (rcol, ritem, rindex) => {
            if(ritem.floatingip) {
              return (
                  <a onClick={listener.bind(null, ritem.floatingip.id)}>
                    {ritem.floatingip.floating_ip_address}
                  </a>
              );
            } else {
              return '';
            }
          };
          break;
        case 'ext_gw':
          col.render = (rcol, ritem, rindex) => {
            if(ritem.external_gateway_info) {
              return ritem.external_gateway_info.enable_snat ? __.on : __.off;
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

  clickTableCheckbox(e, status, clickedRow, arr) {
    // console.log('tableOnClick: ', e, status, clickedRow, arr);
    this.updateBtns(status, clickedRow, arr);
  }

  clearTableState() {
    this.refs.dashboard.clearTableState();
  }

  clickBtns(e, key) {
    // console.log('Button clicked:', key);
    switch (key) {
      case 'prv_network':
        break;
      case 'refresh':
        this.refresh();
        break;
      default:
        break;
    }
  }

  refresh() {
    this.listInstance();
    this.refs.dashboard.clearState();
  }

  updateBtns(status, clickedRow, arr) {
    var _conf = this.state.config,
      btns = _conf.btns;
    var updateDropdownBtns = (items) => {
      items.map((item) => {
        item.items.map((btn) => {
          switch(btn.key) {
            case 'delete':
              btn.disabled = (arr.length === 1) ? false : true;
              break;
            case 'dis_gw':
              btn.disabled = (arr.length === 1) ? false : true;
              break;
            default:
              break;
          }
        });
      });
    };

    btns.map((btn) => {
      switch (btn.key) {
        case 'create':
          btn.disabled = (arr.length === 1) ? false : true;
          break;
        case 'delete':
          btn.disabled = (arr.length === 1) ? false : true;
          break;
        case 'more':
          updateDropdownBtns(btn.dropdown.items);
          break;
        default:
          break;
      }
    });

    this._stores.checkedRow = arr;
    this.setState({
      config: _conf
    });
  }

  clickDropdownBtn(e, item) {
    switch(item.key) {
      case 'delete':
        deleteModal({
          action: 'delete',
          type:'router',
          onDelete: function(data, cb) {
            cb(true);
          }
        });
        break;
      default:
        break;
    }
  }

  changeSearchInput(str) {
    // console.log('search:', str);
  }

  render() {
    return (
      <div className="halo-module-router" style={this.props.style}>
        <MainTable ref="dashboard" moduleID="router" config={this.state.config} eventList={this._eventList} />
      </div>
    );
  }
}

module.exports = Model;
