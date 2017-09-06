require('./style/index.less');

var React = require('react');
var Main = require('client/components/main_paged/index');
var BasicProps = require('client/components/basic_props/index');

var deleteModal = require('client/components/modal_delete/index');

var request = require('./request');
var config = require('./config.json');
var moment = require('client/libs/moment');
var __ = require('locale/client/admin.lang.json');
var getStatusIcon = require('../../utils/status_icon');
var utils = require('../../utils/utils');

class Model extends React.Component {

  constructor(props) {
    super(props);

    moment.locale(HALO.configs.lang);

    this.state = {
      config: config
    };

    ['onInitialize', 'onAction'].forEach((m) => {
      this[m] = this[m].bind(this);
    });

    this.stores = {
      urls: []
    };
  }

  componentWillMount() {
    this.state.config.table.column.find((col) => {
      if (col.key === 'ip_address') {
        col.sortBy = function(item1, item2) {
          var a = item1.fixed_ips[0] ? item1.fixed_ips[0].ip_address : '',
            b = item2.fixed_ips[0] ? item2.fixed_ips[0].ip_address : '';
          return utils.ipFormat(a) - utils.ipFormat(b);
        };
      }
    });
    this.tableColRender(this.state.config.table.column);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if(nextProps.style.display === 'none' && this.props.style.display === 'none') {
      return false;
    }
    return true;
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.style.display !== 'none' && this.props.style.display === 'none') {
      this.loadingTable();
      this.onInitialize(nextProps.params);
    }
  }

  tableColRender(columns) {
    columns.map((column) => {
      switch(column.key) {
        case 'ip_address':
          column.render = (col, item, i) => {
            var arr = [];
            item.fixed_ips.forEach((_item, index) => {
              if(_item.ip_address) {
                index && arr.push(', ');
                arr.push(<span key={index}>{_item.ip_address}</span>);
              }
            });
            return arr;
          };
          break;
        case 'project':
          column.render = (col, item, i) => {
            return item.tenant_id ?
              <span>{item.tenant_id}</span> : '';
          };
          break;
        default:
          break;
      }
    });
  }

  onInitialize(params) {
    if(params[2]) {
      this.getSingle(params[2]);
    } else {
      this.getList();
    }
  }

  getInitializeListData() {
    this.getList();
  }

  getSingle(id) {
    this.clearState();

    var table = this.state.config.table;
    request.getPortByID(id).then((res) => {
      if (res.port) {
        table.data = [res.port];
      } else {
        table.data = [];
      }
      this.setPagination(table, res);
      this.updateTableData(table, res._url);
    }).catch((res) => {
      table.data = [];
      table.pagination = {};
      this.updateTableData(table, res._url);
    });
  }

  getList() {
    this.clearState();

    var table = this.state.config.table;
    request.getList(table.limit).then((res) => {
      table.data = res.ports;
      this.setPagination(table, res);
      this.updateTableData(table, res._url);
    });
  }

  getNextListData(url, refreshDetail) {
    var table = this.state.config.table;
    request.getNextList(url).then((res) => {
      if (res.port) {
        table.data = [res.port];
      } else if (res.ports) {
        table.data = res.ports;
      } else {
        table.data = [];
      }

      this.setPagination(table, res);
      this.updateTableData(table, res._url, refreshDetail);
    }).catch((res) => {
      table.data = [];
      table.pagination = {};
      this.updateTableData(table, res._url);
    });
  }

  updateTableData(table, currentUrl, refreshDetail, callback) {
    var newConfig = this.state.config;
    newConfig.table = table;
    newConfig.table.loading = false;

    this.setState({
      config: newConfig
    }, () => {
      this.stores.urls.push(currentUrl.split('/v2.0/')[1]);

      var detail = this.refs.dashboard.refs.detail,
        params = this.props.params;

      if (detail && refreshDetail && params.length > 2) {
        detail.refresh();
      }

      callback && callback();
    });
  }

  setPagination(table, res) {
    var pagination = {},
      next = res.ports_links ? res.ports_links[0] : null;

    if(next && next.rel === 'next') {
      pagination.nextUrl = next.href.split('/v2.0/')[1];
    }

    var history = this.stores.urls;

    if(history.length > 0) {
      pagination.prevUrl = history[history.length - 1];
    }

    table.pagination = pagination;

    return table;
  }

  refresh(data, params) {
    if(!data) {
      data = {};
    }
    if(!params) {
      params = this.props.params;
    }

    if(data.initialList) {
      if(data.loadingTable) {
        this.loadingTable();
      }
      if(data.clearState) {
        this.clearState();
      }

      this.getInitializeListData();
    } else if(data.refreshList) {
      if(params[2]) {
        if(data.loadingDetail) {
          this.loadingDetail();
          this.refs.dashboard.setRefreshBtnDisabled(true);
        }
      } else {
        if(data.loadingTable) {
          this.loadingTable();
        }
      }

      var history = this.stores.urls,
        url = history.pop();

      this.getNextListData(url, data.refreshDetail);
    }
  }

  loadingTable() {
    var _config = this.state.config;
    _config.table.loading = true;

    this.setState({
      config: _config
    });
  }

  loadingDetail() {
    this.refs.dashboard.refs.detail.loading();
  }

  clearUrls() {
    this.stores.urls = [];
  }

  clearState() {
    this.clearUrls();

    var dashboard = this.refs.dashboard;
    if (dashboard) {
      dashboard.clearState();
    }
  }

  onAction(field, actionType, refs, data) {
    switch(field) {
      case 'btnList':
        this.onClickBtnList(data.key, refs, data);
        break;
      case 'search':
        this.onClickSearch(actionType, refs, data);
        break;
      case 'table':
        this.onClickTable(actionType, refs, data);
        break;
      case 'detail':
        var item = data.rows[0];
        this.loadingDetail();
        request.getSubnetsById(item.fixed_ips).then(() => {
          if(item.device_id.indexOf('dhcp') === 0 || !item.device_id) {
            this.onClickDetailTabs(actionType, refs, data);
          } else {
            request.getDeviceById(item).then(() => {
              this.onClickDetailTabs(actionType, refs, data);
            });
          }
        });
        break;
      default:
        break;
    }
  }

  onClickSearch(actionType, refs, data) {
    if (actionType === 'click') {
      this.loadingTable();
      if (data.text) {
        this.getSingle(data.text);
      } else {
        this.getList();
      }
    }
  }

  onClickDetailTabs(tabKey, refs, data) {
    var {rows} = data;
    var detail = refs.detail;
    var contents = detail.state.contents;

    switch(tabKey) {
      case 'description':
        if(rows.length === 1) {
          var basicPropsItem = this.getBasicPropsItems(rows[0]);

          contents[tabKey] = (
            <div>
              <BasicProps
                title={__.basic + __.properties}
                defaultUnfold={true}
                tabKey={'description'}
                items={basicPropsItem}
                rawItem={rows[0]}
                onAction={this.onDetailAction.bind(this)}
                dashboard={this.refs.dashboard ? this.refs.dashboard : null} />
            </div>
          );
        }
        break;
      default:
        break;
    }

    detail.setState({
      contents: contents,
      loading: false
    });
  }

  getBasicPropsItems(item) {
    var device = item.device_owner,
      getSourceInfo = () => {
        switch(0) {
          case device.indexOf('network:dhcp'):
            return 'DHCP';
          case device.indexOf('network:router'):
            return (<span>
                <i className="glyphicon icon-router" />
                <span>{item.device_name || '(' + item.device_id.substr(0, 8) + ')'}</span>
              </span>);
          case device.indexOf('compute'):
            return (<span>
              <i className="glyphicon icon-instance" />
              <a data-type="router" href={'/admin/instance/' + item.device_id}>
                {item.device_name || '(' + item.device_id.substr(0, 8) + ')'}
              </a>
            </span>);
          default:
            return '-';
        }
      },
      getFloatingIP = () => {
        switch(0) {
          case device.indexOf('network:floatingip'):
            return (<span>
                <a data-type="router" href={'/admin/floating-ip/' + item.device_id}>
                  {item.floating_ip_address}
                </a>
              </span>);
          default:
            return '-';
        }
      };

    var items = [{
      title: __.name,
      content: item.name || '(' + item.id.substring(0, 8) + ')',
      type: 'editable'
    }, {
      title: __.id,
      content: item.id
    }, {
      title: __.subnet,
      content: <span>
        <i className="glyphicon icon-subnet" />
        <span>
          {item.fixed_ips[0].subnet_name || '(' + item.fixed_ips[0].subnet_id.substr(0, 8) + ')'}
        </span>
        <span>{' / ' + item.fixed_ips[0].ip_address}</span>
      </span>
    }, {
      title: __.floating_ip,
      content: getFloatingIP()
    }, {
      title: __.related + __.sources,
      content: getSourceInfo()
    }, {
      title: __.project + __.id,
      content: item.tenant_id ? item.tenant_id : '-'
    }, {
      title: __.status,
      type: 'status',
      content: getStatusIcon(item.status)
    }, {
      title: __.ip + __.address,
      content: item.fixed_ips[0].ip_address
    }, {
      title: __.mac + __.address,
      content: item.mac_address
    }];

    item.fixed_ips.forEach((subnet, i) => {
      if(i > 0) {
        var obj = {
          content: <span>
            <i className="glyphicon icon-subnet" />
            <span>
              {subnet.subnet_name || '(' + subnet.subnet_id.substr(0, 8) + ')'}
            </span>
            <span>{' / ' + subnet.ip_address}</span>
          </span>
        };
        items.splice(2 + i, 0, obj);
      }
    });

    return items;
  }

  onDetailAction(tabKey, actionType, data) {
    switch(tabKey) {
      case 'description':
        this.onDescriptionAction(actionType, data);
        break;
      default:
        break;
    }
  }

  onDescriptionAction(actionType, data) {
    switch(actionType) {
      case 'edit_name':
        var {rawItem, newName} = data;
        request.editPortName(rawItem, newName).then((res) => {
          this.refresh({
            refreshList: true,
            refreshDetail: true
          });
        });
        break;
      default:
        break;
    }
  }

  onClickTable(actionType, refs, data) {
    switch(actionType) {
      case 'check':
        this.onClickTableCheckbox(refs, data);
        break;
      case 'pagination':
        var url,
          history = this.stores.urls;

        if (data.direction === 'prev') {
          history.pop();
          if (history.length > 0) {
            url = history.pop();
          }
        } else if (data.direction === 'next') {
          url = data.url;
        } else { //default
          url = this.stores.urls[0];
          this.clearState();
        }

        this.loadingTable();
        this.getNextListData(url);
        break;
      case 'filtrate':
        delete data.rows;
        this.clearState();
        var table = this.state.config.table;
        request.getFilterList(data).then((res) => {
          table.data = res.ports;
          this.setPagination(table, res);
          this.updateTableData(table, res._url);
        }).catch((res) => {
          table.data = [];
          table.pagination = null;
          this.updateTableData(table, String(res.responseURL));
        });
        this.loadingTable();
        break;
      default:
        break;
    }
  }

  onClickBtnList(actionType, refs, data) {
    var rows = data.rows,
      params = this.props.params,
      table = this.state.config.table,
      that = this;

    switch(actionType) {
      case 'delete':
        deleteModal({
          __: __,
          action: 'delete',
          type: 'port',
          data: rows,
          onDelete: function(_data, cb) {
            request.deletePorts(rows).then((res) => {
              cb(true);
              that.refresh(table.data, params);
            });
          }
        });
        break;
      case 'refresh':
        this.refresh({
          refreshList: true,
          refreshDetail: true,
          loadingTable: true,
          loadingDetail: true
        });
        break;
      default:
        break;
    }
  }

  onClickTableCheckbox(refs, data) {
    var {rows} = data,
      btnList = refs.btnList,
      btns = btnList.state.btns;

    btnList.setState({
      btns: this.btnListRender(rows, btns)
    });
  }

  btnListRender(rows, btns) {
    for(let key in btns) {
      switch(key) {
        case 'delete':
          btns[key].disabled = (rows.length > 0) ? false : true;
          break;
        default:
          break;
      }
    }

    return btns;
  }

  render() {
    return (
      <div className="halo-module-port" style={this.props.style}>
        <Main
          ref="dashboard"
          visible={this.props.style.display === 'none' ? false : true}
          onInitialize={this.onInitialize}
          onAction={this.onAction}
          __={__}
          config={this.state.config}
          params={this.props.params}
          getStatusIcon={getStatusIcon}
        />
      </div>
    );
  }

}

module.exports = Model;
