require('./style/index.less');

var React = require('react');
var MainTable = require('client/components/main_table/index');
var config = require('./config.json');
var __ = require('i18n/client/lang.json');

var request = require('./request');

class Model extends React.Component {

  constructor(props) {
    super(props);

    config.table.data = [];
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

  bindEventList() {
    this._eventList = {
      tabOnClick: this.tabOnClick,
      btnsOnClick: this.btnsOnClick.bind(this),
      searchOnChange: this.searchOnChange,
      tableCheckboxOnClick: this.tableCheckboxOnClick.bind(this)
    };
  }

  updateTableData(data) {
    var conf = this.state.config;
    conf.table.data = data;

    this.setState({
      config: conf
    });
  }

  listInstance() {
    var that = this;

    this.updateTableData([]);
    request.listInstances().then(function(data) {
      that.updateTableData(data.subnets);
    }, function(err) {
      that.updateTableData([]);
      console.debug(err);
    });
  }

  tabOnclick(e, item) {
    if (item.key === 'network') {
      window.location = 'project/subnet';
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

  tableCheckboxOnClick(e, status, clickedRow, arr) {
    // console.log('tableOnClick: ', e, status, clickedRow, arr);
    this.controlBtns(status, clickedRow, arr);
  }

  clearTableState() {
    this.refs.dashboard.clearTableState();
  }

  btnsOnClick(e, key) {
    // console.log('Button clicked:', key);
    switch (key) {
      case 'prv_network':
        break;
      case 'refresh':
        this.clearTableState();
        this.listInstance();
        break;
      default:
        break;
    }
  }

  controlBtns(status, clickedRow, arr) {
    var conf = this.state.config,
      btns = conf.btns;

    btns.map((btn) => {
      switch(btn.key) {
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
      config: conf
    });
  }

  searchOnChange(str) {
    // console.log('search:', str);
  }

  render() {
    return (
      <div className="halo-modules-subnet" style={this.props.style}>
        <MainTable ref="dashboard" config={this.state.config} eventList={this._eventList}/>
      </div>
    );
  }
}

module.exports = Model;
