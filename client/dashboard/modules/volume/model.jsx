require('./style/index.less');

var React = require('react');
var MainTable = require('client/components/main_table/index');
var config = require('./config.json');
var __ = require('i18n/client/lang.json');
var request = require('./request');

class Model extends React.Component {

  constructor(props) {
    super(props);

    this.setTableColRender(config.table.column);
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
            return ritem.multiattach ? __.shared : '-';
          };
          break;
        case 'attributes':
          col.render = (rcol, ritem, rindex) => {
            return __[ritem.metadata.attached_mode];
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
          col.title += __[val];
        });
      }

      this.setTableColRender(col);
    });
  }

  clickTableCheckbox(e, status, clickedRow, arr) {
    //   console.log('tableOnClick: ', e, status, clickedRow, arr);
    this.updateBtns(status, clickedRow, arr);
  }

  clickBtns(e, key) {
    // console.log('clickBtns: key is', key);
    switch (key) {
      case 'create_instance':
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
  }

  changeSearchInput(str) {
    // console.log('search: text is', str);
  }

  updateBtns(status, clickedRow, arr) {
    var _conf = this.state.config,
      btns = _conf.btns;

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
      config: _conf
    });
  }

  render() {

    return (
      <div className="halo-module-volume" style={this.props.style}>
        <MainTable ref="dashboard" config={this.state.config} eventList={this._eventList} />
      </div>
    );
  }

}

module.exports = Model;
