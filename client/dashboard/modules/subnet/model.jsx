require('./style/index.less');

var React = require('react');
var uskin = require('client/uskin/index');
var Button = uskin.Button;
var MainTable = require('client/components/main_table/index');
var BasicProps = require('client/components/basic_props/index');
var DetailMinitable = require('client/components/detail_minitable/index');
var getStatusIcon = require('client/dashboard/utils/status_icon');
var config = require('./config.json');
var __ = require('i18n/client/lang.json');
var router = require('client/dashboard/cores/router');
var Request = require('client/dashboard/cores/request');
var request = require('./request');

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
      clickDetailTabs: this.clickDetailTabs.bind(this)
    };
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
    request.listInstances().then(function(data) {
      that.updateTableData(data.subnets);
    }, function(err) {
      that.updateTableData([]);
      console.debug(err);
    });
  }

  clickDetailTabs(tab, item, callback) {
    switch(tab.key) {
      case 'description':
        if (item.length > 1) {
          callback(
            <div className="no-data-desc">
              <p>{__.view_is_unavailable}</p>
            </div>
          );
          break;
        }

        Request.get({
          url: '/api/v1/' + HALO.user.projectId + '/subnets/' + item[0].id
        }).then((data) => {
          var basicPropsItem = this.getBasicPropsItems(data.subnet),
            virtualInterfaceItem = this.getVirtualInterfaceItems(data.subnet.nics);

          callback(
            <div>
              <BasicProps title={__.basic + __.properties}
                defaultUnfold={true}
                items={basicPropsItem ? basicPropsItem : []}/>
              <DetailMinitable
                title={__['virtual-interface']}
                defaultUnfold={true}
                tableConfig={virtualInterfaceItem ? virtualInterfaceItem : []}>
                <Button value={__.add_ + __['virtual-interface']}/>
              </DetailMinitable>
            </div>
          );
        }, (err) => {
          //console.log(err);
        });
        break;
      default:
        break;
    }
  }

  getBasicPropsItems(item) {
    var data = [{
      title: __.name,
      content: item.name
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
        </span> : null
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
        name: <a data-type="router" href={'/project/nic/' + element.id}>{element.name ? element.name : '(' + element.id.slice(0, 8) + ')'}</a>,
        ip_address: element.fixed_ips[0].ip_address,
        mac_address: element.mac_address,
        instance: <div>
            <i className="glyphicon icon-instance"/>
            <a data-type="router" href={'/project/instance/' + element.instance.id}>{element.instance.name}</a>
          </div>,
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

  setTableColRender(column) {
    column.map((col) => {
      switch (col.key) {
        case 'prv_network':
          col.render = (rcol, ritem, rindex) => {
            return ritem.network ?
              <span>
                <i className="glyphicon icon-network" />
                <a data-type="router" href={'/project/network/' + ritem.network.id}>
                  {ritem.network.name}
                </a>
              </span> : '';
          };
          break;
        case 'assc_router':
          col.render = (rcol, ritem, rindex) => {
            return ritem.router.id ?
              <span>
                <i className="glyphicon icon-router" />
                <a data-type="router" href={'/project/router/' + ritem.router.id}>
                  {ritem.router.name}
                </a>
              </span> : '';
          };
          break;
        case 'ip_ver':
          col.render = (rcol, ritem, rindex) => {
            return ritem.ip_version === 4 ? 'IP v4' : ritem.ip_version;
          };
          break;
        case 'enable_dhcp':
          col.render = (rcol, ritem, rindex) => {
            return ritem.enable_dhcp ? __.yes : __.no;
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

    btns.map((btn) => {
      switch(btn.key) {
        case 'create':
          btn.disabled = (arr.length === 1) ? false : true;
          break;
        case 'delete':
          btn.disabled = (arr.length === 1) ? false : true;
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

  changeSearchInput(str) {
    // console.log('search:', str);
  }

  render() {
    return (
      <div className="halo-module-subnet" style={this.props.style}>
        <MainTable ref="dashboard" moduleID="subnet" config={this.state.config} eventList={this._eventList} />
      </div>
    );
  }
}

module.exports = Model;
