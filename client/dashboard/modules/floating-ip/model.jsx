require('./style/index.less');

var React = require('react');
var MainTable = require('client/components/main_table/index');
var config = require('./config.json');

var request = require('./request');

class Model extends React.Component {

  constructor(props) {
    super(props);

    config.table.data = [];
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

  bindEventList() {
    this._eventList = {
      btnsOnClick: this.btnsOnClick.bind(this),
      controlBtns: this.controlBtns.bind(this),
      dropdownBtnOnClick: this.dropdownBtnOnClick,
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

  loadingTable() {
    this.updateTableData(null);
  }

  listInstance() {
    var that = this;

    this.loadingTable();
    request.listInstances().then(function(data) {
      that.updateTableData(data.floatingips);
    }, function(err) {
      that.updateTableData([]);
      console.debug(err);
    });

  }

  setTableColRender(column) {
    column.map((col) => {
      switch (col.key) {
        case 'assc_resource': //router.name or server
          col.render = (rcol, ritem, rindex) => {
            if (ritem.router) {
              return ritem.router.name;
            } else if (ritem.server) {
              return ritem.server.name;
            }
            return '';
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

  btnsOnClick(e, key) {
    switch (key) {
      case '':
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

  dropdownBtnOnClick(e, status) {
    // console.log('dropdownBtnOnClick: status is', status);
  }

  controlBtns(status, clickedRow, arr) {
    var conf = this.state.config,
      btns = conf.btns;

    var shouldAssociate = (arr.length === 1) && !(arr[0].router || arr[0].server);

    btns.map((btn) => {
      switch(btn.key) {
        case 'assc_to_instance':
          btn.disabled = shouldAssociate ? false : true;
          break;
        case 'assc_to_router':
          btn.disabled = shouldAssociate ? false : true;
          break;
        case 'assc_to_ldbalacer':
          btn.disabled = shouldAssociate ? false : true;
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
      <div className="halo-modules-floatingip" style={this.props.style}>
        <MainTable ref="dashboard" config={this.state.config} eventList={this._eventList}/>
      </div>
    );
  }

}

module.exports = Model;
