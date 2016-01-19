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
      btnsOnClick: this.btnsOnClick,
      dropdownBtnOnClick: this.dropdownBtnOnClick,
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

    request.listInstances().then(function(data) {
      that.updateTableData(data.servers);
    }, function(err) {
      that.updateTableData([]);
      console.debug(err);
    });

  }

  setTableColRender(column) {
    column.map((col) => {
      switch (col.key) {
        case 'image':
          col.render = (rcol, ritem, rindex) => {
            var listener = (_item, _col, _index, e) => {
              e.preventDefault();
              console.log('print ' + _item.image.name, _item);
            };
            return ritem.image ?
              <a style={{cursor: 'pointer'}} onClick={listener.bind(null, ritem, rcol, rindex)}>{ritem.image.name}</a> : '';
          };
          break;
        case 'ip_address':
          col.render = (rcol, ritem, rindex) => {
            var str = '';
            if (ritem.addresses.private) {
              for (let item of ritem.addresses.private) {
                if (item.version === 4 && item['OS-EXT-IPS:type'] === 'fixed') {
                  str = item.addr;
                  break;
                }
              }
            }
            return str;
          };
          break;
        case 'floating_ip':
          col.render = (rcol, ritem, rindex) => {
            return ritem.floatingip ? ritem.floatingip.floating_ip_address : '';
          };
          break;
        case 'instance_type':
          col.render = (rcol, ritem, rindex) => {
            return ritem.flavor ? ritem.flavor.name : '';
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
      case 'create_instance':
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
        case 'vnc_console':
          btn.disabled = (arr.length === 1) ? false : true;
          break;
        case 'power_off':
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

  render() {

    return (
      <div className="halo-modules-instance" style={this.props.style}>
        <MainTable ref="dashboard" config={this.state.config} eventList={this._eventList}/>
      </div>
    );
  }

}

module.exports = Model;
