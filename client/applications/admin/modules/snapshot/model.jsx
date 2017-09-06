require('./style/index.less');

var React = require('react');
var Main = require('client/components/main_paged/index');
var BasicProps = require('client/components/basic_props/index');

var deleteModal = require('client/components/modal_delete/index');

var config = require('./config.json');
var moment = require('client/libs/moment');
var __ = require('locale/client/admin.lang.json');
var request = require('./request');
var getStatusIcon = require('../../utils/status_icon');
var csv = require('./pop/csv/index');

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
        default:
          break;
      }
    });
  }

  initializeFilter(filters, res) {
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
      id: 'error',
      name: __.error
    }, {
      id: 'deleting',
      name: __.deleting
    }, {
      id: 'error_deleting',
      name: __.error_deleting
    }];
    setOption('status', statusTypes);
  }

  onInitialize(params) {
    var filter = this.state.config.filter;
    this.initializeFilter(filter);

    if (params[2]) {
      this.getSingle(params[2]);
    } else {
      this.getList();
    }
  }

  getInitialListData() {
    this.getList();
  }

  getSingle(snapshotID) {
    this.clearState();

    var table = this.state.config.table;

    request.getSnapshotByID(snapshotID).then((res) => {
      table.data = res.list;
      table.pagination = null;
      this.updateTableData(table, res._url);
    }).catch((res) => {
      table.data = [];
      table.pagination = null;
      this.updateTableData(table, String(res.responseURL));
    });
  }

  getList() {
    this.clearState();

    var table = this.state.config.table;
    var pageLimit = table.limit;

    request.getList(pageLimit).then((res) => {
      table.data = res.list;
      this.setPagination(table, res);
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
      if (res.list) {
        table.data = res.list;
      } else {
        table.data = [];
      }

      this.setPagination(table, res);
      this.updateTableData(table, res._url);
    }).catch((res) => {
      table.data = [];
      table.pagination = null;
      this.updateTableData(table, String(res.responseURL));
    });
  }

  getFilteredList(data) {
    var table = this.state.config.table;

    request.filterFromAll(data, table.limit).then((res) => {
      table.data = res.list;
      this.setPagination(table, res);
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

      var snapshotID = data.snapshot_id,
        allTenant = data.all_tenant;

      if (snapshotID) {
        this.getSingle(snapshotID.id);
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
      this.stores.urls.push(currentUrl);

      var detail = this.refs.dashboard.refs.detail,
        params = this.props.params;
      if (detail && refreshDetail && params.length > 2) {
        detail.refresh();
      }
    });
  }

  setPagination(table, res) {
    var pagination = {},
      next = res.links.next ? res.links.next : null;

    if (next) {
      pagination.nextUrl = next;
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
        this.onClickDetailTabs(actionType, refs, data);
        break;
      default:
        break;
    }
  }

  onClickBtnList(key, refs, data) {
    var rows = data.rows,
      that = this;

    switch(key) {
      case 'export_csv':
        request.getFieldsList().then((res) => {
          csv(res);
        });
        break;
      case 'delete':
        deleteModal({
          __: __,
          action: 'delete',
          type: 'snapshot',
          data: rows,
          onDelete: function(_data, cb) {
            request.deleteSnapshots(rows).then((res) => {
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
    for(let key in btns) {
      switch (key) {
        case 'export_csv':
          btns[key].disabled = false;
          break;
        case 'delete':
          btns[key].disabled = rows.length > 0 ? false : true;
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
      case 'filtrate':
        delete data.rows;
        this.clearState();

        var table = this.state.config.table;

        request.getFilterList(data).then((res) => {
          table.data = res.list;
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

  onClickDetailTabs(tabKey, refs, data) {
    var {rows} = data;
    var detail = refs.detail;
    var contents = detail.state.contents;
    var syncUpdate = true;

    switch(tabKey) {
      case 'description':
        if (rows.length === 1) {
          syncUpdate = false;
          detail.setState({loading: true});
          request.getVolumeById(rows[0].volume_id).then((res) => {
            var basicPropsItem = this.getBasicPropsItems(rows[0], res.volume);
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
            detail.setState({
              contents: contents,
              loading: false
            });
          });

        }
        break;
      default:
        break;
    }

    if(syncUpdate) {
      detail.setState({
        contents: contents,
        loading: false
      });
    }
  }

  getBasicPropsItems(item, volume) {
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
      title: __.volume,
      content: <span>
        <i className="glyphicon icon-volume" />
        <a data-type="router" href={'/admin/volume/' + item.volume_id}>
          {volume.name || '(' + item.volume_id.substr(0, 8) + ')'}
        </a>
      </span>
    }, {
      title: __.type,
      content: volume.volume_type === 'sata' ? __.performance_type : __.capacity_type
    }, {
      title: __.project + __.id,
      type: 'copy',
      content: item['os-extended-snapshot-attributes:project_id']
    }, {
      title: __.user + __.id,
      type: 'copy',
      content: volume.user_id
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
        request.editSnapshotName(rawItem, newName).then((res) => {
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
      <div className="halo-module-snapshot" style={this.props.style}>
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
