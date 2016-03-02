require('./style/index.less');

var React = require('react');
var MainTable = require('client/components/main_table/index');
var BasicProps = require('client/components/basic_props/index');
var config = require('./config.json');
var __ = require('i18n/client/lang.json');
var request = require('./request');
var Request = require('client/dashboard/cores/request');
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

  clickDetailTabs(tab, item, callback) {
    switch (tab.key) {
      case 'description':
        if (item.length > 1) {
          callback(
            <div className="no-data-desc">
              <p>{__.view_is_unavailable}</p>
            </div>
          );
        }
        Request.get({
          url: '/api/v1/' + HALO.user.projectId + '/floatingips/' + item[0].id
        }).then((res) => {
          var basicPropsItem = this.getBasicPropsItems(res.floatingip);
          callback(
            <BasicProps
              title={__.basic + __.properties}
              defaultUnfold={true}
              items={basicPropsItem ? basicPropsItem : []} />
          );
        });
        break;
      default:
        callback(null);
        break;
    }
  }

  getBasicPropsItems(item) {
    var items = [{
      title: __.id,
      content: item.id
    }, {
      title: __.ip + __.address,
      content: item.floating_ip_address
    }, {
      title: __.associate_gl + __.resource,
      content: item.router_id ?
        <span>
          <i className="glyphicon icon-router" />
          <a data-type="router" href={'/project/router/' + item.router_id}>
            {item.router.name}
          </a>
        </span> : ''
    }, {
      title: __.bandwidth,
      content: ''
    }, {
      title: __.carrier,
      content: ''
    }, {
      title: __.status,
      type: 'status',
      status: item.status,
      content: __[item.status.toLowerCase()]
    }];

    return items;
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
            if (ritem.router_id) {
              return (
                <span>
                  <i className="glyphicon icon-router" />
                  <a data-type="router" href={'/project/router/' + ritem.router.id}>
                    {ritem.router.name}
                  </a>
                </span>
              );
            } else if (ritem.server) {
              return (
                <span>
                  <i className="glyphicon icon-instance" />
                  <a data-type="router" href={'/project/instance/' + ritem.server.id}>
                    {ritem.server.name}
                  </a>
                </span>
              );
            }
            return '';
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
      case 'create':
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
    switch(status.key) {
      case 'delete':
        deleteModal({
          action: 'delete',
          type: 'floating_ip',
          onDelete: function(data, cb) {
            cb(true);
          }
        });
        break;
      default:
        break;
    }
  }

  updateBtns(status, clickedRow, arr) {
    var conf = this.state.config,
      btns = conf.btns;

    var shouldAssociate = (arr.length === 1) && !(arr[0].router || arr[0].server);
    var updateDropdownBtns = (items) => {
      items.map((item) => {
        item.map((btn) => {
          switch(btn.key) {
            case 'dssc':
              btn.disabled = (arr.length === 1) ? false : true;
              break;
            case 'chg_bandwidth':
              btn.disabled = (arr.length === 1) ? false : true;
              break;
            case 'delete':
              btn.disabled = (arr.length > 0) ? false : true;
              break;
            default:
              break;
          }
        });
      });
    };

    btns.map((btn) => {
      switch (btn.key) {
        case 'assc_to_instance':
          btn.disabled = shouldAssociate ? false : true;
          break;
        case 'assc_to_router':
          btn.disabled = shouldAssociate ? false : true;
          break;
        case 'assc_to_ldbalacer':
          btn.disabled = shouldAssociate ? false : true;
          break;
        case 'more':
          updateDropdownBtns(btn.dropdown.items);
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
      <div className="halo-module-floating-ip" style={this.props.style}>
        <MainTable ref="dashboard" moduleID="floating-ip" config={this.state.config} eventList={this._eventList} />
      </div>
    );
  }

}

module.exports = Model;
