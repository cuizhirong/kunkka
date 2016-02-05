require('./style/index.less');

var React = require('react');
var MainTable = require('client/components/main_table/index');
var BasicProps = require('client/components/basic_props/index');
var config = require('./config.json');
var __ = require('i18n/client/lang.json');
var request = require('./request');
var router = require('client/dashboard/cores/router');

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
    router.on('changeState', this.onChangeState);
    this.bindEventList();
    this.setTableColRender(config.table.column);
    this.listInstance();
  }

  onChangeState(pathList) {
    if (pathList.length >= 3 && pathList[1] === 'image') {
      let row = pathList[2];
      console.log('image切换选中行时 ' + row);
    }
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
      clickTableCheckbox: this.clickTableCheckbox.bind(this),
      clickDetailTabs: this.clickDetailTabs.bind(this)
    };
  }

  clickDetailTabs(tab, item, callback) {
    switch (tab.key) {
      case 'description':
        if (item.length > 1) {
          callback(
            <div className="no-data-desc">
              <p>{__.view_is_unavailable}</p>
            </div>
          );
          break;
        }

        var basicPropsItem = this.getBasicPropsItems(item[0]);
        callback(
          <div>
            <BasicProps
              title={__.basic + __.properties}
              defaultUnfold={true}
              items={basicPropsItem ? basicPropsItem : []} />
          </div>
        );
        break;
      default:
        callback(null);
        break;
    }
  }

  getBasicPropsItems(item) {
    var items = [{
      title: __.name,
      content: item.name
    }, {
      title: __.id,
      content: item.id
    }, {
      title: __.size,
      content: Math.round(item.size / 1024) + ' MB'
    }, {
      title: __.type,
      content: item.image_type === 'snapshot' ? __.snapshot : __.image
    }, {
      title: __.checksum,
      content: item.checksum
    }, {
      title: __.status,
      type: 'status',
      status: item.status,
      content: __[item.status.toLowerCase()]
    }, {
      title: __.create + __.time,
      type: 'time',
      content: item.created_at
    }, {
      title: __.update + __.time,
      type: 'time',
      content: item.updated_at
    }];

    return items;
  }

  updateTableData(data) {
    var path = router.getPathList();
    if (path.length > 2 && data && data.length > 0) {
      console.log('初始化image时选择row' + path[2]);
    }

    var _conf = this.state.config;
    _conf.table.data = data;

    this.setState({
      config: _conf
    }, () => {
      if (path.length > 2 && data && data.length > 0) {
        // console.log('初始化instance时选择row' + path[2]);
        router.replaceState('/' + path.join('/'), null, null, true);
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
        case 'type':
          col.render = (rcol, ritem, rindex) => {
            return ritem.image_type === 'snapshot' ? __.snapshot : __.image;
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
    switch (key) {
      case 'create':
        break;
      case 'del_img':
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
    // console.log('search:', str);
  }

  updateBtns(status, clickedRow, arr) {
    var _conf = this.state.config,
      btns = _conf.btns;

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
      config: _conf
    });
  }

  render() {
    return (
      <div className="halo-module-image" style={this.props.style}>
        <MainTable ref="dashboard" moduleID="image" config={this.state.config} eventList={this._eventList} />
      </div>
    );
  }

}

module.exports = Model;
