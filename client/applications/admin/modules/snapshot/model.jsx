require('./style/index.less');

//react components
var React = require('react');
var Main = require('../../components/main/index');

//detail components
var BasicProps = require('client/components/basic_props/index');
var deleteModal = require('client/components/modal_delete/index');

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

//initialize table data
  onInitialize(params) {
    var _config = this.state.config,
      filter = _config.filter,
      table = _config.table;

    if (params[2]) {
      request.getSnapshotByIDInitialize(params[2]).then((res) => {
        this.initializeFilter(filter, res[1]);
        table.data = [res[0].snapshot];
        this.updateTableData(table, res[0]._url);
      });
    } else {
      var pageLimit = this.state.config.table.limit;
      request.getListInitialize(pageLimit).then((res) => {
        this.initializeFilter(filter, res[1]);
        var newTable = this.processTableData(table, res[0]);
        this.updateTableData(newTable, res[0]._url);
      });
    }
  }

//request: get list data(according to page limit)
  getInitialListData() {
    var pageLimit = this.state.config.table.limit;
    request.getList(pageLimit).then((res) => {
      var table = this.processTableData(this.state.config.table, res);
      this.updateTableData(table, res._url);
    });
  }

//request: jump to next page according to the given url
  getNextListData(url, refreshDetail) {
    request.getNextList(url).then((res) => {
      var table = this.processTableData(this.state.config.table, res);
      this.updateTableData(table, res._url, refreshDetail);
    });
  }

//request: filter request
  onFilterSearch(actionType, refs, data) {
    if (actionType === 'search') {
      this.loadingTable();

      var snapshotID = data.snapshot_id,
        allTenant = data.all_tenant;

      if (snapshotID) {
        request.getSnapshotByID(snapshotID.id).then((res) => {
          var table = this.state.config.table;
          table.data = [res.snapshot];
          this.updateTableData(table, res._url);
        });
      } else if (allTenant){
        request.filterFromAll(allTenant).then((res) => {
          var table = this.state.config.table;
          table.data = res.snapshots;
          this.updateTableData(table, res._url);
        });
      }
    }
  }

//rerender: update table data
  updateTableData(table, currentUrl, refreshDetail) {
    var newConfig = this.state.config;
    newConfig.table = table;
    newConfig.table.loading = false;

    this.setState({
      config: newConfig
    }, () => {
      this.stores.urls.push(currentUrl.split('/v2/')[1]);

      var detail = this.refs.dashboard.refs.detail,
        params = this.props.params;
      if (detail && refreshDetail && params.length > 2) {
        detail.refresh();
      }
    });
  }

//change table data structure: to record url history
  processTableData(table, res) {
    if (res.snapshot) {
      table.data = [res.snapshot];
    } else if (res.snapshots) {
      table.data = res.snapshots;
    }

    var pagination = {},
      next = res.snapshots_links ? res.snapshots_links[0] : null;

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

//refresh: according to the given data rules
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

  clearState() {
    this.stores = {
      urls: []
    };
    this.refs.dashboard.clearState();
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
        request.getVolumeById(data.rows[0].volume_id).then((res) => {
          this.onClickDetailTabs(actionType, refs, data, res.volume);
        });
        break;
      default:
        break;
    }
  }

  onClickBtnList(key, refs, data) {
    var rows = data.rows;

    switch(key) {
      case 'delete':
        deleteModal({
          __: __,
          action: 'delete',
          type: 'snapshot',
          data: rows,
          onDelete: function(_data, cb) {
            request.deleteSnapshots(rows).then((res) => {
              cb(true);
            });
          }
        });
        break;
      case 'refresh':
        var params = this.props.params,
          refreshData = {};

        if (params[2]) {
          refreshData.refreshList = true;
          refreshData.refreshDetail = true;
          refreshData.loadingTable = true;
          refreshData.loadingDetail = true;
        } else {
          refreshData.initialList = true;
          refreshData.loadingTable = true;
          refreshData.clearState = true;
        }

        this.refresh(refreshData, params);
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

        if (data.direction === 'next') {
          url = data.url;
        } else {
          history.pop();
          if (history.length > 0) {
            url = history.pop();
          }
        }

        this.loadingTable();
        this.getNextListData(url);
        break;
      default:
        break;
    }
  }

  onClickDetailTabs(tabKey, refs, data, volume) {
    var {rows} = data;
    var detail = refs.detail;
    var contents = detail.state.contents;

    var isAvailableView = (_rows) => {
      if (_rows.length > 1) {
        contents[tabKey] = (
          <div className="no-data-desc">
            <p>{__.view_is_unavailable}</p>
          </div>
        );
        return false;
      } else {
        return true;
      }
    };

    switch(tabKey) {
      case 'description':
        if (isAvailableView(rows)) {
          var basicPropsItem = this.getBasicPropsItems(rows[0], volume);

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
        <a data-type="router" href={'/dashboard/volume/' + item.volume_id}>
          {volume.name || '(' + item.volume_id.substr(0, 8) + ')'}
        </a>
      </span>
    }, {
      title: __.type,
      content: volume.volume_type === 'sata' ? __.performance_type : __.capacity_type
    }, {
      title: __.project + __.id,
      content: item['os-extended-snapshot-attributes:project_id']
    }, {
      title: __.user + __.id,
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
          config={this.state.config}
          params={this.props.params}
          getStatusIcon={getStatusIcon}
        />
      </div>
    );
  }
}

module.exports = Model;
