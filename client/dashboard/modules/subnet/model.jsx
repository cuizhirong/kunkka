require('./style/index.less');

var React = require('react');
var MainTable = require('client/components/main_table/index');
var config = require('./config.json');
var __ = require('i18n/client/lang.json');
var router = require('client/dashboard/cores/router');
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
      clickTabs: this.clickTabs,
      clickBtns: this.clickBtns.bind(this),
      updateBtns: this.updateBtns.bind(this),
      changeSearchInput: this.changeSearchInput,
      clickTableCheckbox: this.clickTableCheckbox.bind(this)
    };
  }

  updateTableData(data) {
    var _conf = this.state.config;
    _conf.table.data = data;

    this.setState({
      config: _conf
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

  clickTabs(e, item) {
    if (item.key === 'prv_network') {
      router.pushState('/project/network');
    }
  }

  setTableColRender(column) {
    column.map((col) => {
      switch (col.key) {
        case 'prv_network':
          col.render = (rcol, ritem, rindex) => {
            return ritem.network ? ritem.network.name : '';
          };
          break;
        case 'assc_router':
          col.render = (rcol, ritem, rindex) => {
            return ritem.router ? ritem.router.name : '';
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
