require('./style/index.less');

var React = require('react');
var MainTable = require('client/components/main_table/index');
var config = require('./config.json');
var __ = require('i18n/client/lang.json');
var request = require('./request');
var equal = require('deep-equal');
var clone = require('clone');

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
    if (nextProps.style.display !== this.props.style.display || !equal(this.state.config, nextState.config)) {
      return true;
    }
    return false;
  }

  bindEventList() {
    this._eventList = {
      clickBtns: this.clickBtns.bind(this),
      updateBtns: this.updateBtns.bind(this),
      changeSearchInput: this.changeSearchInput,
      clickTableCheckbox: this.clickTableCheckbox.bind(this)
    };
  }

  updateTableData(data) {
    var _conf = this.state.config;
    _conf = clone(_conf, false);
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
    request.listRouters().then(function(data) {
      that.updateTableData(data.routers);
    }, function(err) {
      that.updateTableData([]);
      console.debug(err);
    });
  }

  setTableColRender(column) {
    column.map((col) => {
      switch (col.key) {
        case 'ext_gw':
          col.render = (rcol, ritem, rindex) => {
            return ritem.external_gateway_info ? __.yes : __.no;
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
    var _conf = clone(this.state.config, false),
      btns = _conf.btns;

    btns.map((btn) => {
      switch (btn.key) {
        case 'crt_subnet':
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
        <MainTable ref="dashboard" config={this.state.config} eventList={this._eventList} />
      </div>
    );
  }
}

module.exports = Model;
