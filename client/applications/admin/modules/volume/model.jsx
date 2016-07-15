require('./style/index.less');

var React = require('react');
var Main = require('client/components/main_paged/index');
var BasicProps = require('client/components/basic_props/index');
var deleteModal = require('client/components/modal_delete/index');

var detachInstance = require('./pop/detach_instance/index');

var config = require('./config.json');
var moment = require('client/libs/moment');
var __ = require('locale/client/admin.lang.json');
var request = require('./request');
var getStatusIcon = require('../../utils/status_icon');

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
    this.tableColRender(this.state.config.table.column);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.style.display === 'none' && this.props.style.display === 'none') {
      return false;
    }
    return true;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.style.display !== 'none' && this.props.style.display === 'none') {
      this.loadingTable();
      this.onInitialize(nextProps.params);
    }
  }

  tableColRender(columns) {
    columns.map((column) => {
      switch (column.key) {
        case 'size':
          column.render = (col, item, i) => {
            return item.size + 'GB';
          };
          break;
        case 'type':
          column.render = (col, item, i) => {
            return item.volume_type ?
              <span>
                <i className="glyphicon icon-performance" />
                {item.volume_type === 'sata' ? __.performance_type : __.capacity_type}
              </span> : '';
          };
          break;
        case 'shared':
          column.render = (col, item, i) => {
            return item.multiattach ? __.yes : __.no;
          };
          break;
        case 'attributes':
          column.render = (col, item, i) => {
            if (item.metadata.readonly) {
              return item.metadata.readonly === 'False' ? __.read_write : __.read_only;
            } else {
              return '';
            }
          };
          break;
        default:
          break;
      }
    });
  }

  initializeFilter(filters) {
    var setOption = function(key, data) {
      filters.forEach((filter) => {
        filter.items.forEach((item) => {
          if(item.key === key) {
            item.data = data;
          }
        });
      });
    };

    var statusTypes = [{
      id: 'available',
      name: __.available
    }, {
      id: 'in-use',
      name: __['in-use']
    }, {
      id: 'error',
      name: __.error
    }, {
      id: 'error_deleting',
      name: __.error_deleting
    }, {
      id: 'detaching',
      name: __.detaching
    }];
    setOption('status', statusTypes);
  }

  onInitialize(params) {
    var _config = this.state.config;
    this.initializeFilter(_config.filter);

    if (params[2]) {
      this.getSingle(params[2]);
    } else {
      this.getList();
    }
  }

  getInitialListData() {
    this.getList();
  }

  getList() {
    this.clearState();

    var table = this.state.config.table;
    var pageLimit = table.limit;

    request.getList(pageLimit).then((res) => {
      table.data = res.volumes;
      this.setPaginationData(table, res);
      this.updateTableData(table, res._url);
    }).catch((res) => {
      table.data = [];
      table.pagination = null;
      this.updateTableData(table, String(res.responseURL));
    });
  }

  getSingle(volumeID) {
    this.clearState();

    var table = this.state.config.table;
    var pageLimit = table.limit;

    request.getVolumeByID(volumeID, pageLimit).then((res) => {
      table.data = [res.volume];
      this.setPaginationData(table, res);
      this.updateTableData(table, res._url);
    }).catch((res) => {
      table.data = [];
      table.pagination = null;
      this.updateTableData(table, String(res.responseURL));
    });
  }

  getNextListData(url) {
    var table = this.state.config.table;

    request.getNextList(url).then((res) => {
      table.data = res.volumes;
      this.setPaginationData(table, res);
      this.updateTableData(table, res._url);
    }).catch((res) => {
      table.data = [];
      table.pagination = null;
      this.updateTableData(table, String(res.responseURL));
    });
  }

  getFilteredList(data) {
    var table = this.state.config.table;
    var pageLimit = table.limit;

    request.filterFromAll(data, pageLimit).then((res) => {
      table.data = res.volumes;
      this.setPaginationData(table, res);
      this.updateTableData(table, res._url);
    }).catch((res) => {
      table.data = [];
      table.pagination = null;
      this.updateTableData(table, String(res.responseURL));
    });
  }

  onFilterSearch(actionType, refs, data) {
    this.clearState();

    if (actionType === 'search') {
      this.loadingTable();

      var volumeID = data.volume_id,
        allTenant = data.all_tenant;

      if (volumeID) {
        this.getSingle(volumeID.id);
      } else if (allTenant){
        this.getFilteredList(allTenant);
      } else {
        this.getInitialListData();
      }
    }
  }

  updateTableData(table, currentUrl, refreshDetail) {
    var newConfig = this.state.config;
    newConfig.table = table;
    newConfig.table.loading = false;

    this.setState({
      config: newConfig
    }, () => {
      this.stores.urls.push(currentUrl.split('/v2/')[1]);

      var dashboard = this.refs.dashboard,
        detail = dashboard.refs.detail,
        params = this.props.params;

      if (detail && refreshDetail && params.length > 2) {
        detail.refresh();
      }
    });
  }

  setPaginationData(table, res) {
    var pagination = {},
      next = res.volumes_links ? res.volumes_links[0] : null;

    if (next && next.rel === 'next') {
      pagination.nextUrl = next.href.split('/v2/')[1];
    }

    var history = this.stores.urls;

    if (history.length > 0) {
      pagination.prevUrl = history[history.length - 1];
    }
    table.pagination = pagination;

    return table;
  }

  refresh(data, params) {
    if (!data) {
      data = {};
    }
    if (!params) {
      params = this.props.params;
    }

    if (data.initialList) {
      if (data.loadingTable) {
        this.loadingTable();
      }
      if (data.clearState) {
        this.clearState();
      }

      this.getInitialListData();
    } else if (data.refreshList) {
      if (params[2]) {
        if (data.loadingDetail) {
          this.loadingDetail();
          this.refs.dashboard.setRefreshBtnDisabled(true);
        }
      } else {
        if (data.loadingTable) {
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
    var volume = data.rows[0];

    switch (field) {
      case 'filter':
        this.onFilterSearch(actionType, refs, data);
        break;
      case 'btnList':
        this.onClickBtnList(data.key, refs, data);
        break;
      case 'table':
        this.onClickTable(actionType, refs, data);
        break;
      case 'detail':
        if(volume.attachments[0]) {
          this.loadingDetail();
          request.getServerById(volume.attachments[0].server_id).then((res) => {
            this.onClickDetailTabs(actionType, refs, data, res.server);
          }).catch(() => {
            volume.attachments[0].disabled = true;
            this.onClickDetailTabs(actionType, refs, data);
          });
        } else {
          this.onClickDetailTabs(actionType, refs, data);
        }
        break;
      default:
        break;
    }
  }

  onClickBtnList(key, refs, data) {
    var rows = data.rows,
      that = this;

    switch (key) {
      case 'dissociate':
        detachInstance(rows[0], null, function() {
          that.refresh({
            refreshList: true,
            refreshDetail: true
          });
        });
        break;
      case 'delete':
        deleteModal({
          __: __,
          action: 'delete',
          type: 'volume',
          data: rows,
          onDelete: function(_data, cb) {
            request.deleteVolumes(rows).then((res) => {
              that.refresh({
                refreshList: true
              });
              cb(true);
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
    var len = rows.length;
    // var setBtnState = (key) => {
    //   request.getServerById(rows[0].attachments[0].server_id).then(() => {
    //     btns[key].disabled = false;
    //   }).catch(() => {
    //     btns[key].disabled = true;
    //   });
    // };

    for(let key in btns) {
      switch (key) {
        case 'dissociate':
          if((len === 1 && rows[0].status === 'in-use') && rows[0].attachments.length > 0) {
            // setBtnState(key);
            btns[key].disabled = false;
          } else {
            btns[key].disabled = true;
          }
          break;
        case 'delete':
          btns[key].disabled = (len > 0 && rows[0].status === 'available') ? false : true;
          break;
        default:
          break;
      }
    }

    return btns;
  }

  onClickTable(actionType, refs, data) {
    switch (actionType) {
      case 'check':
        this.onClickTableCheckbox(refs, data);
        break;
      case 'pagination':
        var url,
          history = this.stores.urls;

        if (data.direction === 'prev'){
          history.pop();
          if (history.length > 0) {
            url = history.pop();
          }
        } else if (data.direction === 'next') {
          url = data.url;
        } else {//default
          url = this.stores.urls[0];
          this.clearState();
        }

        this.loadingTable();
        this.getNextListData(url);
        break;
      default:
        break;
    }
  }

  onClickDetailTabs(tabKey, refs, data, server) {
    var {rows} = data;
    var detail = refs.detail;
    var contents = detail.state.contents;

    switch(tabKey) {
      case 'description':
        if (rows.length === 1) {
          var basicPropsItem = this.getBasicPropsItems(rows[0], server);

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

  getBasicPropsItems(item, server) {
    var items = [{
      title: __.name,
      content: item.name || '(' + item.id.substr(0, 8) + ')',
      type: 'editable'
    }, {
      title: __.id,
      content: item.id
    }, {
      title: __.size,
      content: item.size + 'GB'
    }, {
      title: __.attached_instance,
      content: item.attachments[0] ?
          <span>
            <i className="glyphicon icon-instance" />
            {item.attachments[0].disabled ?
              <span>{'(' + item.attachments[0].server_id.substr(0, 8) + ')'}</span> :
              <a data-type="router" href={'/admin/instance/' + item.attachments[0].server_id}>
                {server ? server.name : '(' + item.attachments[0].server_id.substr(0, 8) + ')'}
              </a>
            }
          </span> : '-'
    }, {
      title: __.type,
      content: item.volume_type === 'sata' ? __.performance_type : __.capacity_type
    }, {
      title: __.project + __.id,
      content: item['os-vol-tenant-attr:tenant_id']
    }, {
      title: __.user + __.id,
      content: item.user_id
    }, {
      title: __.attributes,
      content: (() => {
        if (item.metadata.readonly) {
          return item.metadata.readonly === 'False' ? __.read_write : __.read_only;
        } else {
          return '-';
        }
      })()
    }, {
      title: __.status,
      content: getStatusIcon(item.status)
    }, {
      title: __.created + __.time,
      type: 'time',
      content: item.created_at
    }];

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
        request.editVolumeName(rawItem, newName).then((res) => {
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

  render() {
    return (
      <div className="halo-module-volume" style={this.props.style}>
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
