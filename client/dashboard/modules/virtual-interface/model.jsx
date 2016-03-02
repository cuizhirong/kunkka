require('./style/index.less');

var React = require('react');
var MainTable = require('client/components/main_table/index');
var BasicProps = require('client/components/basic_props/index');
var __ = require('i18n/client/lang.json');
var config = require('./config.json');
var request = require('./request');
var router = require('client/dashboard/cores/router');
var Request = require('client/dashboard/cores/request');
var deleteModal = require('client/components/modal_delete/index');

class Model extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      config: config
    };

    this.bindEventList = this.bindEventList.bind(this);
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
      clickDropdownBtn: this.clickDropdownBtn,
      clickTableCheckbox: this.clickTableCheckbox.bind(this),
      clickDetailTabs: this.clickDetailTabs.bind(this)
    };
  }

  clickDetailTabs(tab, item, callback) {
    var isAvailableView = (_item) => {
      if (_item.length > 1) {
        callback(
          <div className="no-data-desc">
            <p>{__.view_is_unavailable}</p>
          </div>
        );
        return false;
      } else {
        return true;
      }
    };

    switch (tab.key) {
      case 'description':
        if (!isAvailableView(item)) {
          break;
        }

        Request.get({
          url: '/api/v1/' + HALO.user.projectId + '/nic/' + item[0].id
        }).then((data) => {
          var basicPropsItem = this.getBasicPropsItems(data.nic);

          callback(
            <div>
              <BasicProps
                title = {__.basic + __.properties}
                defaultUnfold = {true}
                items = {basicPropsItem}/>
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
    var items = [{
      title: __.name,
      content: item.name ? item.name : '(' + item.id.substring(0, 8) + ')'
    }, {
      title: 'ID',
      content: item.device_id
    }, {
      title: __.associate_gl + __.instance,
      content: item.instance ?
        <div><i className="glyphicon icon-instance"></i><a data-type="router" href={'/project/instance/' + item.instance.id}>{item.instance.name}</a></div> : ''
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
      content: item.subnet.id ?
        <div><i className="glyphicon icon-subnet"></i><a data-type="router" href={'/project/subnet/' + item.subnet.id}>{item.subnet.name}</a></div> : ''
    }, {
      title: __.floating_ip,
      content: item.floatingip.id ?
        <div><i className="glyphicon icon-floating-ip"></i><a data-type="router" href={'/project/floatingips/' + item.floatingip.id}>{item.floatingip.name}</a></div> : ''
    }, {
      title: __.security + __.group,
      content:
        <div>{
          item.security_groups.map((ritem, i) =>
            <div key={i}><i className="glyphicon icon-security-group"></i><a data-type="router" href={'/project/security-group/' + ritem.id}>{ritem.name}</a></div>)
        }</div>
    }, {
      title: __.security + __.restrict,
      content: item.port_security_enabled ?
        <span className="label-active">已开启</span> : <span className="label-down">未开启</span>
    }, {
      title: __.status,
      type: 'status',
      status: item.status,
      content: __[item.status.toLowerCase()]
    }, {
      title: __.create + __.time,
      type: 'time',
      content: item.created_at
    }];

    return items;
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
      data.nics.map((item, i) => {
        data.nics[i].name = item.name ? item.name : '(' + item.id.substring(0, 8) + ')';
      });
      that.updateTableData(data.nics);
    }, function(err) {
      that.updateTableData([]);
      console.debug(err);
    });

  }

  setTableColRender(column) {
    column.map((col) => {
      switch (col.key) {
        case 'subnet':
          col.render = (rcol, ritem, rindex) => {
            return ritem.subnet.id ?
              <div><i className="glyphicon icon-subnet"></i><a data-type="router" href={'/project/subnet/' + ritem.subnet.id}>{ritem.subnet.name}</a></div> : '';
          };
          break;
        case 'related_instance':
          col.render = (rcol, ritem, rindex) => {
            return ritem.instance ?
              <div><i className="glyphicon icon-instance"></i><a data-type="router" href={'/project/instance/' + ritem.instance.id}>{ritem.instance.name}</a></div> : '';
          };
          break;
        case 'restrict':
          col.render = (rcol, ritem, rindex) => {
            return ritem.port_security_enabled ?
              <span className="label-active">已开启</span> : <span className="label-down">未开启</span>;
          };
          break;
        case 'ip_adrs':
          col.render = (rcol, ritem, rindex) => {
            return <span>{
              ritem.fixed_ips.map((item, i) =>
                <span key={i}>{(i > 0 ? ', ' : '') + item.ip_address}</span>
              )
            }</span>;
          };
          break;
        case 'floating_ip':
          col.render = (rcol, ritem, rindex) => {
            return ritem.floatingip.id ?
              <div><i className="glyphicon icon-floating-ip"></i><a data-type="router" href={'/project/floatingips/' + ritem.floatingip.id}>{ritem.floatingip.name}</a></div> : '';
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

  clickBtns(e, key) {
    switch (key) {
      case 'create':
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

  clickDropdownBtn(e, status) {
    // console.log('clickDropdownBtn: status is', status);
    switch(status.key) {
      case 'delete':
        deleteModal({
          action: 'delete',
          type:'virtual-interface',
          onDelete: function(data, cb) {
            cb(true);
          }
        });
        break;
      default:
        break;
    }
  }

  updateBtns(status, clickedRow, arr) {
    var conf = this.state.config,
      btns = conf.btns;

    var updateDropdownBtns = (items) => {
      items.map((item) => {
        item.map((btn) => {
          switch(btn.key) {
            case 'modify':
              btn.disabled = (arr.length === 1) ? false : true;
              break;
            case 'disable':
              btn.disabled = (arr.length === 1) ? false : true;
              break;
            case 'delete':
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
        case 'more':
          updateDropdownBtns(btn.dropdown.items);
          break;
        default:
          break;
      }
    });

    this._stores.checkedRow = arr;
    this.setState({
      config: conf
    });
  }

  render() {
    return (
      <div className="halo-module-virtual-interface" style={this.props.style}>
        <MainTable ref="dashboard" moduleID="virtual-interface" config={this.state.config} eventList={this._eventList} />
      </div>
    );
  }

}

module.exports = Model;
