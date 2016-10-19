require('./style/index.less');

var React = require('react');
var Main = require('client/components/main_paged/index');
var BasicProps = require('client/components/basic_props/index');

var migratePop = require('./pop/migrate/index');

var request = require('./request');
var config = require('./config.json');
var moment = require('client/libs/moment');
var __ = require('locale/client/admin.lang.json');
var router = require('client/utils/router');
var getStatusIcon = require('../../utils/status_icon');
var exportCSV = require('../../utils/export_csv');

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
      urls: [],
      hosts: []
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
        case 'vcpu':
          column.render = (col, item, i) => {
            return item.vcpus_used + ' / ' + item.vcpus;
          };
          break;
        case 'memory':
          column.render = (col, item, i) => {
            return (item.memory_mb_used / 1024).toFixed(2) + ' / ' + (item.memory_mb / 1024).toFixed(2);
          };
          break;
        case 'disk_capacity':
          column.render = (col, item, i) => {
            return item.local_gb_used + ' / ' + item.local_gb;
          };
          break;
        default:
          break;
      }
    });
  }

//initialize table data
  onInitialize(params) {
    if (params[2]) {
      this.getHypervisorById(params[2]);
      this.getHypervisorListToStore();
    } else {
      this.getHypervisorList();
    }
  }

//request: get Hypervisor By Id
  getHypervisorById(id) {
    this.clearState();

    var table = this.state.config.table;
    request.getHypervisorById(id).then((res) => {
      var newTable = this.processTableData(table, res);
      this.updateTableData(newTable, res._url, true, () => {
        var pathList = router.getPathList();
        router.replaceState('/admin/' + pathList.slice(1).join('/'), null, null, true);
      });
    }).catch((res) => {
      table.data = [];
      this.updateTableData(table);
    });
  }

  getHypervisorListToStore() {
    var pageLimit = this.state.config.table.limit;
    request.getHypervisorList(pageLimit).then((res) => {
      this.stores.hosts = res.hypervisors;
    });
  }

//request: get Hypervisor List
  getHypervisorList() {
    this.clearState();

    var pageLimit = this.state.config.table.limit;
    request.getHypervisorList(pageLimit).then((res) => {
      var table = this.processTableData(this.state.config.table, res);
      this.stores.hosts = res.hypervisors;
      this.updateTableData(table, res._url);
    });
  }

//rerender: update table data
  updateTableData(table, currentUrl, refreshDetail, callback) {
    var newConfig = this.state.config;
    newConfig.table = table;
    newConfig.table.loading = false;

    this.setState({
      config: newConfig
    }, () => {
      if (currentUrl) {
        this.stores.urls.push(currentUrl);

        var detail = this.refs.dashboard.refs.detail,
          params = this.props.params;
        if (detail && refreshDetail && params.length > 2) {
          detail.refresh();
        }
        callback && callback();
      }
    });
  }

  //change table data structure: to record url history
  processTableData(table, res) {
    if (res.hypervisors) {
      table.data = res.hypervisors;
    } else if (res.hypervisor) {
      table.data = [res.hypervisor];
    }

    var pagination = {};

    res.hypervisors_links && res.hypervisors_links.forEach((link) => {
      if (link.rel === 'prev') {
        pagination.prevUrl = link.href;
      } else if (link.rel === 'next') {
        pagination.nextUrl = link.href;
      }
    });
    table.pagination = pagination;

    return table;
  }

  getInitialListData() {
    this.getHypervisorList();
  }

//request: jump to next page according to the given url
  getNextListData(url, refreshDetail) {
    request.getNextList(url).then((res) => {
      var table = this.processTableData(this.state.config.table, res);
      this.updateTableData(table, res._url, refreshDetail);
    });
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
    _config.table.data = [];

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
        this.onClickDetailTabs(actionType, refs, data);
        break;
      default:
        break;
    }
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

  onClickBtnList(key, refs, data) {
    var {rows} = data,
      requestData;

    var that = this;
    function refresh() {
      var r = {
        refreshList: true,
        refreshDetail: true
      };

      that.refresh(r);
    }

    if (rows.length === 1) {
      requestData = {
        binary: 'nova-compute',
        host: rows[0].service.host
      };
    }
    switch(key) {
      case 'enable':
        request.enableHost(requestData).then((res) => {
          refresh();
        });
        break;
      case 'disable':
        request.disableHost(requestData).then((res) => {
          refresh();
        });
        break;
      case 'migrate':
        migratePop({
          row: rows[0],
          hostTypes: this.stores.hosts
        });
        break;
      case 'export_csv':
        let url = '/api/v1/' + HALO.user.projectId + '/os-hypervisors/csv?region=' + HALO.current_region;
        exportCSV(url);
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

  onClickSearch(actionType, refs, data) {
    if (actionType === 'click') {
      this.loadingTable();

      if (data.text) {
        this.getHypervisorById(data.text);
      } else {
        this.getHypervisorList();
      }
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
    var sole = rows.length === 1 ? rows[0] : null;

    for(let key in btns) {
      switch (key) {
        case 'migrate':
          btns[key].disabled = sole ? false : true;
          break;
        case 'enable':
          btns[key].disabled = (sole && sole.status === 'disabled') ? false : true;
          break;
        case 'disable':
          btns[key].disabled = (sole && sole.status === 'enabled') ? false : true;
          break;
        case 'export_csv':
          btns[key].disabled = false;
          break;
        default:
          break;
      }
    }

    return btns;
  }

  onClickDetailTabs(tabKey, refs, data) {
    var {rows} = data;
    var detail = refs.detail;
    var contents = detail.state.contents;

    switch(tabKey) {
      case 'description':
        if (rows.length === 1) {
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
    var items = [{
      title: __.name,
      content: item.hypervisor_hostname
    }, {
      title: __.id,
      content: item.id
    }, {
      title: __.ip,
      content: item.host_ip
    }, {
      title: __.vcpu,
      content: item.vcpus_used + ' / ' + item.vcpus
    }, {
      title: __.memory + __.gb,
      content: (item.memory_mb_used / 1024).toFixed(2) + ' / ' + (item.memory_mb / 1024).toFixed(2)
    }, {
      title: __.disk + __.capacity + __.gb,
      content: item.local_gb_used + ' / ' + item.local_gb
    }, {
      title: __.virtual_machine + __.counts,
      content: item.running_vms
    }, {
      title: __.physical_host + __.type,
      content: item.hypervisor_type
    }, {
      title: __.status,
      content: getStatusIcon(item.status)
    }, {
      title: __.state,
      content: item.state
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
      default:
        break;
    }
  }

  render() {
    return (
      <div className="halo-module-host" style={this.props.style}>
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
