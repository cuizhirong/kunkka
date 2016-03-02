require('./style/index.less');

var React = require('react');
var MainTable = require('client/components/main_table/index');
var BasicProps = require('client/components/basic_props/index');
var config = require('./config.json');
var __ = require('i18n/client/lang.json');
var Request = require('client/dashboard/cores/request');
var request = require('./request');
var router = require('client/dashboard/cores/router');
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
      that.updateTableData(data.snapshots);
    }, function(err) {
      that.updateTableData([]);
      console.debug(err);
    });

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

    switch(tab.key) {
      case 'description':
        if (!isAvailableView(item)) {
          break;
        }

        Request.get({
          url: '/api/v1/' + HALO.user.projectId + '/snapshots/' + item[0].id
        }).then((data) => {
          var basicPropsItem = this.getBasicPropsItems(data.snapshot);

          callback(
            <BasicProps
              title={__.basic + __.properties}
              defaultUnfold={true}
              items={basicPropsItem ? basicPropsItem : []} />
          );
        });
        break;
      default:
        break;
    }
  }

  getBasicPropsItems(item) {
    var data = [{
      title: __.name,
      content: item.name
    }, {
      title: __.id,
      content: item.id
    }, {
      title: __.volume,
      content: item.volume_id ?
        <span>
          <i className="glyphicon icon-volume" />
          <a data-type="router" href={'/project/volume/' + item.volume.id}>{item.volume.name}</a>
        </span>
        : null
    }, {
      title: __.type,
      content: ''
    }, {
      title: __.status,
      type: 'status',
      status: item.status,
      content: __[item.status.toLowerCase()]
    }, {
      title: __.create + __.time,
      type: 'time',
      content: item.created
    }];

    return data;
  }

  setTableColRender(column) {
    column.map((col) => {
      switch (col.key) {
        case 'size':
          col.render = (rcol, ritem, rindex) => {
            return ritem.size + ' GB';
          };
          break;
        case 'volume':
          col.render = (rcol, ritem, rindex) => {
            return (
              <span>
                <i className="glyphicon icon-volume" />
                <a data-type="router" href={'/project/volume/' + ritem.volume.id}>
                  {ritem.volume.name}
                </a>
              </span>
            );
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
      case 'crt_volume':
        break;
      case 'refresh':
        this.refresh();
        break;
      case 'del_snapshot':
        deleteModal({
          action: 'delete',
          type: 'snapshot',
          onDelete: function(data, cb) {
            cb(true);
          }
        });
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

  updateBtns(status, clickedRow, arr) {
    var _conf = this.state.config,
      btns = _conf.btns;

    btns.map((btn) => {
      switch(btn.key) {
        case 'create':
          break;
        case 'del_snapshot':
          btn.disabled = arr.length > 0 ? false : true;
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
      <div className="halo-module-snapshot" style={this.props.style}>
        <MainTable ref="dashboard" moduleID="snapshot" config={this.state.config} eventList={this._eventList}/>
      </div>
    );
  }

}

module.exports = Model;
