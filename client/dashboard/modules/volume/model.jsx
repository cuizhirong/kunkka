require('./style/index.less');

var React = require('react');
var MainTable = require('client/components/main_table/index');
var config = require('./config.json');
var lang = require('i18n/client/lang.json');

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

  componentDidMount() {
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

    request.listVolumes().then(function(data) {
      that.updateTableData(data.volumes ? data.volumes : []);
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
            return ritem.size + ' GB';
          };
          break;
        case 'attch_instance':
          col.render = (rcol, ritem, rindex) => {
            var servers = '';
            ritem.attachments && ritem.attachments.map((attch, index) => {
              servers += (index <= 0) ? attch.server.name : ' ,' + attch.server.name;
            });
            return servers;
          };
          break;
        case 'shared':
          col.render = (rcol, ritem, rindex) => {
            return ritem.multiattach ? lang.shared : '-';
          };
          break;
        case 'attributes':
          col.render = (rcol, ritem, rindex) => {
            return lang[ritem.metadata.attached_mode];
          };
          break;
        case 'status':
          col.render = (rcol, ritem, rindex) => {
            return lang[ritem.status];
          };
          break;
        default:
          break;
      }
    });
  }

  getTableLang(table) {
    table.column.map((col) => {
      if (col.title_key) {
        col.title = '';
        col.title_key.map((val) => {
          col.title += lang[val];
        });
      }

      this.setTableColRender(col);
    });
  }

  tableCheckboxOnClick(e, status, clickedRow, arr) {
    //   console.log('tableOnClick: ', e, status, clickedRow, arr);
    this.controlBtns(status, clickedRow, arr);
  }

  btnsOnClick(e, key) {
    // console.log('btnsOnClick: key is', key);
    switch (key) {
      case 'create_instance':
        break;
      case 'refresh':
        break;
      default:
        break;
    }
  }

  dropdownBtnOnClick(e, status) {
    // console.log('dropdownBtnOnClick: status is', status);
  }

  searchOnChange(str) {
    // console.log('search: text is', str);
  }

  controlBtns(status, clickedRow, arr) {
    var conf = this.state.config,
      btns = conf.btns;

    btns.map((btn) => {
      switch(btn.key) {
        case 'create_snapshot':
          btn.disabled = (arr.length === 1) ? false : true;
          break;
        case 'attach_to_instance':
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
      <div className="halo-modules-volume" style={this.props.style}>
        <MainTable config={this.state.config} eventList={this._eventList}/>
      </div>
    );
  }

}

module.exports = Model;
