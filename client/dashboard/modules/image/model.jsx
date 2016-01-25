require('./style/index.less');

var React = require('react');
var request = require('client/dashboard/cores/request');
var MainTable = require('client/components/main_table/index');
var config = require('./config.json');
var equal = require('deep-equal');

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
      btnsOnClick: this.btnsOnClick,
      dropdownBtnOnClick: this.dropdownBtnOnClick,
      searchOnChange: this.searchOnChange,
      tableCheckboxOnClick: this.tableCheckboxOnClick.bind(this)
    };
  }

  updateTableData(data) {
    var _conf = this.state.config;
    _conf = JSON.parse(JSON.stringify(_conf));
    _conf.table.column = config.table.column;
    _conf.table.data = data;

    this.setState({
      config: _conf
    });
  }

  listInstance() {
    var that = this;

    request.get({
      url: '/api/v1/images'
    }).then(function(data) {
      that.updateTableData(data.images);
    }, function(err) {
      that.updateTableData([]);
      console.debug(err);
    });

  }

  setTableColRender(column) {
    column.map((col) => {
      switch (col.key) {
        case 'size':
          col.render = (rcol, ritem, rindex) => {
            return Math.round(ritem.size / 1024) + ' MB';
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
    console.log('Button clicked:', key);
    switch (key) {
      case 'del_img':
        break;
      case 'refresh':
        // this.clearTableState();
        break;
      default:
        break;
    }
  }

  dropdownBtnOnClick(e, status) {
    // console.log('dropdownBtnOnClick: status is', status);
  }

  searchOnChange(str) {
    // console.log('search:', str);
  }

  controlBtns(status, clickedRow, arr) {
    var conf = this.state.config,
      btns = conf.btns;

    btns.map((btn) => {
      switch (btn.key) {
        case 'crt_inst':
          btn.disabled = (arr.length !== 1) ? true : false;
          break;
        case 'del_img':
          btn.disabled = (arr.length === 0) ? true : false;
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
      <div className="halo-modules-image" style={this.props.style}>
        <MainTable ref="dashboard" config={this.state.config} eventList={this._eventList}/>
      </div>
    );
  }

}

module.exports = Model;
