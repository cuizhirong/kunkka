require('./style/index.less');

var React = require('react');
var Main = require('client/components/main_paged/index');
var BasicProps = require('client/components/basic_props/index');
var LineChart = require('client/components/line_chart/index');
var DetailMinitable = require('client/components/detail_minitable/index');

var deleteModal = require('client/components/modal_delete/index');
var dissociateFIP = require('./pop/dissociate_fip/index');
var migratePop = require('./pop/migrate/index');

var request = require('./request');
var config = require('./config.json');
var moment = require('client/libs/moment');
var __ = require('locale/client/admin.lang.json');
var router = require('client/utils/router');
var getStatusIcon = require('../../utils/status_icon');
var utils = require('../../utils/utils');
var csv = require('./pop/csv/index');
var getTime = require('client/utils/time_unification');

class Model extends React.Component {

  constructor(props) {
    super(props);

    moment.locale(HALO.configs.lang);

    let tabs = config.table.detail.tabs;
    let enableAlarm = HALO.settings.enable_alarm;
    if (enableAlarm) {
      tabs.push({
        name: ['monitor'],
        key: 'monitor'
      });
    }

    this.updateConfig();
    this.state = {
      config: config
    };

    ['onInitialize', 'onAction', 'tableColRender', 'getFloatingIp', 'getFixedIp'].forEach((m) => {
      this[m] = this[m].bind(this);
    });

    this.stores = {
      urls: [],
      imageTypes: [],
      flavorTypes: [],
      hostTypes: []
    };
  }

  updateConfig() {
    if (!HALO.settings.is_show_trash) {
      config.tabs.splice(1, 1);
    }
  }

  getFloatingIp(item) {
    var floatingIP = [];
    Object.keys(item.addresses).forEach((key) =>
      item.addresses[key].forEach((element) => {
        if (element['OS-EXT-IPS:type'] === 'floating') {
          floatingIP.push(element.addr);
        }
      })
    );
    return floatingIP;
  }

  getFixedIp(item) {
    var ips = item.addresses, ret = [];
    Object.keys(ips).forEach((key) => {
      ips[key].forEach((ele) => {
        if (ele['OS-EXT-IPS:type'] === 'fixed') {
          ret.push(ele.addr);
        }
      });
    });
    return ret;
  }

  componentWillMount() {
    var that = this, a = '', b = '';

    this.state.config.table.column.forEach((col) => {
      if (col.key === 'floating_ip') {
        col.sortBy = function(item1, item2) {
          a = that.getFloatingIp(item1)[0] || '';
          b = that.getFloatingIp(item2)[0] || '';
          return utils.ipFormat(a) - utils.ipFormat(b);
        };
      } else if (col.key === 'fixed_ip') {
        col.sortBy = function(item1, item2) {
          a = that.getFixedIp(item1)[0] || '';
          b = that.getFixedIp(item2)[0] || '';
          return utils.ipFormat(a) - utils.ipFormat(b);
        };
      }
    });
    this.tableColRender(this.state.config.table.column);
  }

  shouldComponentUpdate(nextProps, nextState) {
    //do not trigger render when component stays invisible
    if (nextProps.style.display === 'none' && this.props.style.display === 'none') {
      return false;
    }
    return true;
  }

  componentWillReceiveProps(nextProps) {
    //when component is from the invisible to the visible, update data, otherwise clear state
    if (nextProps.style.display !== 'none' && this.props.style.display === 'none') {
      this.loadingTable();
      this.onInitialize(nextProps.params);
    }
  }

  //helper
  findItemByID(arr, id) {
    var ret;

    arr.some((item) => {
      if (item.id === id) {
        ret = item;
        return true;
      }
    });

    return ret;
  }

  tableColRender(columns) {
    columns.map((column) => {
      switch (column.key) {
        case 'flavor':
          column.render = (col, item, i) => {
            var flavor = this.findItemByID(this.stores.flavorTypes, item.flavor.id);
            return (
              <a data-type="router" href={'/admin/flavor/' + item.flavor.id}>
                {flavor ? flavor.name : '(' + item.flavor.id.substr(0, 8) + ')'}
              </a>
            );
          };
          break;
        case 'image':
          column.render = (col, item, i) => {
            if(item.image) {
              var image = this.findItemByID(this.stores.imageTypes, item.image.id);
              return (
                <a data-type="router" href={'/admin/image/' + item.image.id}>
                  {image ? image.name : '(' + item.image.id.substr(0, 8) + ')'}
                </a>
              );
            } else {
              var bootableVolume = item['os-extended-volumes:volumes_attached'] ? item['os-extended-volumes:volumes_attached'][0].id : '';
              return (
                <a data-type="router" href={'/admin/volume/' + bootableVolume}>
                  {bootableVolume !== '' ? '(' + bootableVolume.substr(0, 8) + ')' : ''}
                </a>
              );
            }
          };
          break;
        case 'floating_ip':
          column.render = (col, item, i) => {
            return item._floatingIP.join(', ');
          };
          break;
        case 'fixed_ip':
          column.render = (col, item, i) => {
            var ips = item.addresses,
              ret = [];

            Object.keys(ips).forEach((key) => {
              ips[key].forEach((ele) => {
                if (ele['OS-EXT-IPS:type'] === 'fixed') {
                  ret.push(ele.addr);
                }
              });
            });

            return ret.join(', ');
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
          if (item.key === key) {
            item.data = data;
          }
        });
      });
    };

    var imageTypes = [];
    res.imageType.list.forEach((image) => {
      imageTypes.push({
        id: image.id,
        name: image.name
      });
    });
    setOption('image', imageTypes);

    var flavorTypes = [];
    res.flavorType.flavors.forEach((flavor) => {
      flavorTypes.push({
        id: flavor.id,
        name: flavor.name
      });
    });
    setOption('flavor', flavorTypes);

    var statusTypes = [{
      id: 'ACTIVE',
      name: __.active
    }, {
      id: 'SHUTOFF',
      name: __.shutoff
    }, {
      id: 'ERROR',
      name: __.error
    }];
    setOption('status', statusTypes);
  }

  addTypesToStore(res) {
    this.stores.imageTypes = res.imageType.list;
    this.stores.flavorTypes = res.flavorType.flavors;
    this.stores.hostTypes = res.hostType.hypervisors;
  }

  //initialize table data
  onInitialize(params) {
    if (params[2]) {
      this.getServerByIDInitialize(params[2]);
    } else {
      this.getListInitialize();
    }
  }

  //request: get server by ID
  getServerByID(serverID) {
    this.clearState();

    var table = this.state.config.table;
    request.getServerByID(serverID).then((res) => {
      table.data = [res.server];
      table = this.processTableData(table, res);
      this.updateTableData(table, res._url);
    }).catch((res) => {
      table.data = [];
      table.pagination = null;
      this.updateTableData(table, String(res.responseURL));
    });
  }

  //request: get server by ID and filter data
  getServerByIDInitialize(serverID) {
    this.clearState();

    var _config = this.state.config,
      filter = _config.filter,
      table = _config.table;

    request.getServerByIDInitialize(serverID).then((res) => {
      this.addTypesToStore(res[1]);
      table.data = [res[0].server];
      this.initializeFilter(filter, res[1]);

      var newTable = this.processTableData(table, res[0]);
      this.updateTableData(newTable, res[0]._url, true, () => {
        var pathList = router.getPathList();
        router.replaceState('/admin/' + pathList.slice(1).join('/'), null, null, true);
      });
    });
  }

  //request: get server list
  getInitialListData() {
    this.clearState();

    var pageLimit = this.state.config.table.limit;
    request.getList(pageLimit).then((res) => {
      var table = this.processTableData(this.state.config.table, res);
      this.updateTableData(table, res._url);
    });
  }

  //request: get server list and filter data
  getListInitialize() {
    this.clearState();

    var _config = this.state.config,
      filter = _config.filter,
      table = _config.table;

    var pageLimit = this.state.config.table.limit;
    request.getListInitialize(pageLimit).then((res) => {
      this.addTypesToStore(res[1]);
      this.initializeFilter(filter, res[1]);

      var newTable = this.processTableData(table, res[0]);
      this.updateTableData(newTable, res[0]._url);
    });
  }

  //request: get next list according to given url
  getNextListData(url, refreshDetail) {
    var table = this.state.config.table;
    request.getNextList(url).then((res) => {
      table = this.processTableData(table, res);
      this.updateTableData(table, res._url, refreshDetail);
    }).catch((res) => {
      table.data = [];
      this.updateTableData(table, String(res.responseURL));
    });
  }

  //request: get filtered list
  getFilterList(filterData) {
    this.clearState();

    var table = this.state.config.table;
    filterData.limit = this.state.config.table.limit;
    request.filterFromAll(filterData).then((res) => {
      table.data = res.servers;
      table = this.processTableData(table, res);
      this.updateTableData(table, res._url);
    }).catch((res) => {
      table.data = [];
      table.pagination = null;
      this.updateTableData(table, String(res.responseURL));
    });
  }

  //request: filter request
  onFilterSearch(actionType, refs, data) {
    if (actionType === 'search') {
      this.loadingTable();

      var serverID = data.instance,
        allTenant = data.all_tenant;

      if (serverID) {
        this.getServerByID(serverID.id);
      } else if (allTenant) {
        this.getFilterList(allTenant);
      } else {
        this.getListInitialize();
      }
    }
  }

  //rerender: update table data
  updateTableData(table, currentUrl, refreshDetail, callback) {
    var newConfig = this.state.config;
    newConfig.table = table;
    newConfig.table.loading = false;

    this.setState({
      config: newConfig
    }, () => {
      this.stores.urls.push(currentUrl.split('/v2.1/')[1]);

      var detail = this.refs.dashboard.refs.detail,
        params = this.props.params;
      if (detail && refreshDetail && params.length > 2) {
        detail.refresh();
      }

      callback && callback();
    });
  }

  setPaginationData(table, res) {
    var pagination = {},
      next = res.servers_links ? res.servers_links[0] : null;

    if (next && next.rel === 'next') {
      pagination.nextUrl = next.href.split('/v2.1/')[1];
    }

    var history = this.stores.urls;

    if (history.length > 0) {
      pagination.prevUrl = history[history.length - 1];
    }
    table.pagination = pagination;

    return table;
  }

  setFloatingIP(table) {
    table.data.forEach((data) => {
      var floatingIP = [];
      Object.keys(data.addresses).forEach((key) =>
        data.addresses[key].forEach((element) => {
          if (element['OS-EXT-IPS:type'] === 'floating') {
            floatingIP.push(element.addr);
          }
        })
      );

      data._floatingIP = floatingIP;
    });

    return table;
  }

  //change table data structure: to record url history
  processTableData(table, res) {
    if (res.server) {
      table.data = [res.server];
    } else if (res.servers) {
      table.data = res.servers;
    }

    table = this.setPaginationData(table, res);
    table = this.setFloatingIP(table);

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
      case 'filter':
        this.onFilterSearch(actionType, refs, data);
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
          table.data = res.servers;
          table = this.processTableData(table, res);
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

  onClickBtnList(key, refs, data) {
    var {rows} = data,
      that = this;

    var refresh = () => {
      this.refresh({
        refreshList: true,
        loadingTable: true,
        refreshDetail: true
      });
    };

    switch (key) {
      case 'migrate':
        migratePop({
          row: rows[0],
          hostTypes: this.stores.hostTypes
        }, null, function(res) {
          refresh();
        });
        break;
      case 'power_on':
        request.poweron(rows[0]).then(function(res) {
          rows.forEach((ele) => {
            ele.status = 'powering_on';
          });

          that.setState({
            config: that.state.config
          });

          that.onClickTableCheckbox(that.refs.dashboard.refs, { rows: rows });
        });
        break;
      case 'power_off':
        request.poweroff(rows[0]).then(function(res) {
          rows.forEach((ele) => {
            ele.status = 'powering_off';
          });

          that.setState({
            config: that.state.config
          });

          that.onClickTableCheckbox(that.refs.dashboard.refs, { rows: rows });
        });
        break;
      case 'reboot':
        request.reboot(rows[0]).then(function(res) {
          refresh();
        });
        break;
      case 'dissociate_floating_ip':
        dissociateFIP(rows[0], null, function(res) {
          refresh();
        });
        break;
      case 'export_csv':
        request.getFieldsList().then((res) => {
          csv(res);
        });
        break;
      case 'delete':
        deleteModal({
          __: __,
          action: 'delete',
          type: 'instance',
          data: rows,
          onDelete: function(_data, cb) {
            request.deleteItem(rows[0]).then((res) => {
              cb(true);
              refresh();
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
    var single = rows.length === 1 ? rows[0] : null;
    btns.export_csv.disabled = false;

    for (let key in btns) {
      if(single) {
        var itemStatus = single.status.toLowerCase();
        switch (key) {
          case 'migrate':
            btns[key].disabled = (itemStatus !== 'error' && itemStatus !== 'error_deleting') ? false : true;
            break;
          case 'power_on':
            btns[key].disabled = itemStatus === 'shutoff' ? false : true;
            break;
          case 'power_off':
          case 'reboot':
            btns[key].disabled = itemStatus === 'active' ? false : true;
            break;
          case 'dissociate_floating_ip':
            btns[key].disabled = single._floatingIP.length > 0 ? false : true;
            break;
          case 'export_csv':
            btns[key].disabled = false;
            break;
          case 'delete':
            btns[key].disabled = false;
            break;
          default:
            break;
        }
      } else {
        if (key !== 'refresh' && key !== 'export_csv') {
          btns[key].disabled = true;
        }
      }

    }

    return btns;
  }

  onClickDetailTabs(tabKey, refs, data) {
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

    switch (tabKey) {
      case 'description':
        if (rows.length === 1) {
          var basicPropsItem = this.getBasicPropsItems(rows[0]);
          var falutDetails = this.getFalutDetails(rows[0]);

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
              {
                rows[0].fault ?
                  <BasicProps
                    title={__.fault_info}
                    defaultUnfold={true}
                    tabKey={'description'}
                    items={falutDetails}
                    rawItem={rows[0]}
                    onAction={this.onDetailAction.bind(this)}
                    dashboard={this.refs.dashboard ? this.refs.dashboard : null} />
                : null
              }
            </div>
          );
          detail.setState({
            contents: contents,
            loading: false
          });
        }
        break;
      case 'monitor':
        if (isAvailableView(rows)) {
          let that = this;

          var updateDetailMonitor = function(newContents, loading) {
            detail.setState({
              contents: newContents,
              loading: loading
            });
          };
          let time = data.time;

          var resourceId = rows[0].id,
            instanceMetricType = ['cpu_util', 'memory.usage', 'disk.read.bytes.rate', 'disk.write.bytes.rate'],
            portMetricType = ['network.incoming.bytes.rate', 'network.outgoing.bytes.rate'];
          var tabItems = [{
            name: __.three_hours,
            key: '300',
            time: 'hour'
          }, {
            name: __.one_day,
            key: '900',
            time: 'day'
          }, {
            name: __.one_week,
            key: '3600',
            time: 'week'
          }, {
            name: __.one_month,
            key: '21600',
            time: 'month'
          }];

          let granularity = '';
          if (data.granularity) {
            granularity = data.granularity;
          } else {
            granularity = '300';
            contents[tabKey] = (<div/>);
            updateDetailMonitor(contents, true);
          }

          tabItems.some((ele) => ele.key === granularity ? (ele.default = true, true) : false);

          let updateContents = (arr) => {
            contents[tabKey] = (
              <LineChart
                __={__}
                item={rows[0]}
                data={arr}
                granularity={granularity}
                tabItems={tabItems}
                start={utils.getTime(time)}
                clickTabs={(e, tab, item) => {
                  that.onClickDetailTabs('monitor', refs, {
                    rows: rows,
                    granularity: tab.key,
                    time: tab.time
                  });
                }} />
            );

            updateDetailMonitor(contents);
          };
          if (data.granularity) {
            updateContents([]);
          }
          request.getResourceMeasures(resourceId, instanceMetricType, granularity, utils.getTime(time)).then((res) => {
            var arr = res.map((r, index) => ({
              title: utils.getMetricName(instanceMetricType[index]),
              unit: utils.getUnit('instance', instanceMetricType[index]),
              xAxis: utils.getChartData(r, granularity, utils.getTime(time)),
              yAxisData: utils.getChartData(r, granularity, utils.getTime(time), 'instance')
            }));
            request.getNetworkResourceId(resourceId).then(_data => {
              request.getPort(_data).then(datas => {
                request.getNetworkResource(granularity, utils.getTime(time), rows[0], datas.datas).then(resourceData => {
                  var portData = resourceData.map((_rd, index) => ({
                    title: utils.getMetricName(portMetricType[index % 2], datas.ips[parseInt(index / 2, 10)]),
                    unit: utils.getUnit('instance', portMetricType[parseInt(index / 2, 10)]),
                    yAxisData: utils.getChartData(_rd, granularity, utils.getTime(time), 'instance'),
                    xAxis: utils.getChartData(_rd, granularity, utils.getTime(time))
                  }));
                  updateContents(arr.concat(portData));
                }).catch(error => {
                  updateContents([{}]);
                });
              });
            }).catch(error => {
              updateContents([{}]);
            });
          }).catch(error => {
            updateContents([{}]);
          });
        }
        break;
      case 'action_log':
        if (isAvailableView(rows)) {
          detail.setState({
            loading: true
          });
          request.getActionLog(rows[0].id).then(res => {
            var actionItems = this.getActionLogs(res.instanceActions);
            contents[tabKey] = (
              <DetailMinitable
                __={__}
                title={__.action_log}
                defaultUnfold={true}
                tableConfig={actionItems ? actionItems : []} />
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
  }

  getActionLogs(item) {
    var tableContent = [];
    item.forEach((ele, index) => {
      var dataObj = {
        request_id: ele.request_id,
        action: __[ele.action],
        start_time: getTime(ele.start_time, true),
        user_id: ele.user_id,
        message: ele.message || '-'
      };
      tableContent.push(dataObj);
    });
    var tableConfig = {
      column: [{
        title: __.request_id,
        key: 'request_id',
        dataIndex: 'request_id'
      }, {
        title: __.action,
        key: 'action',
        dataIndex: 'action'
      }, {
        title: __.start_time,
        key: 'start_time',
        dataIndex: 'start_time'
      }, {
        title: __.user_id,
        key: 'user_id',
        dataIndex: 'user_id'
      }, {
        title: __.message,
        key: 'message',
        dataIndex: 'message'
      }],
      data: tableContent,
      dataKey: 'request_id',
      hover: true
    };

    return tableConfig;
  }

  getBasicPropsItems(item) {
    var flavor = this.findItemByID(this.stores.flavorTypes, item.flavor.id),
      image = this.findItemByID(this.stores.imageTypes, item.image.id),
      fixedIps = (function() {
        var ips = item.addresses,
          ret = [];
        Object.keys(ips).forEach((key) => {
          ips[key].forEach((ele, i) => {
            if (ele['OS-EXT-IPS:type'] === 'fixed') {
              ret.push(ele.addr);
            }
          });
        });
        return ret.join(', ');
      })();

    var getImage = function() {
      if(item.image) {
        return <a data-type="router" href={'/admin/image/' + item.image.id}>
          {image ? image.name : '(' + item.image.id.substr(0, 8) + ')'}
        </a>;
      } else {
        let bootableVolume = item['os-extended-volumes:volumes_attached'] ? item['os-extended-volumes:volumes_attached'][0].id : '';
        return <a data-type="router" href={'/admin/volume/' + bootableVolume}>
          {bootableVolume !== '' ? '(' + bootableVolume.substr(0, 8) + ')' : ''}
        </a>;
      }
    };

    var items = [{
      title: __.name,
      content: item.name || '(' + item.id.substring(0, 8) + ')'
    }, {
      title: __.id,
      content: item.id
    }, {
      title: __.host,
      content: item['OS-EXT-SRV-ATTR:host'] ? item['OS-EXT-SRV-ATTR:host'] : '-'
    }, {
      title: __.flavor,
      content: <a data-type="router" href={'/admin/flavor/' + item.flavor.id}>
          {flavor ? flavor.name : '(' + item.flavor.id.substr(0, 8) + ')'}
        </a>
    }, {
      title: __.image,
      content: getImage()
    }, {
      title: __.fixed_ip,
      content: fixedIps !== '' ? fixedIps : '-'
    }, {
      title: __.floating_ip,
      content: item._floatingIP.length ? item._floatingIP.join(', ') : '-'
    }, {
      title: __.user + __.id,
      type: 'copy',
      content: item.user_id
    }, {
      title: __.project,
      type: 'copy',
      content: item.tenant_id
    }, {
      title: __.status,
      content: getStatusIcon(item.status)
    }, {
      title: __.created + __.time,
      type: 'time',
      content: item.created
    }];

    return items;
  }

  getFalutDetails(item) {
    let items = [];
    if (item.fault) {
      const fault = item.fault;
      items = [{
        title: __.fault_code,
        content: fault.code
      }, {
        title: __.message,
        content: fault.message
      }, {
        title: __.create + __.time,
        type: 'time',
        content: fault.created
      }];
    }

    return items;
  }

  onDetailAction(tabKey, actionType, data) {
    switch (tabKey) {
      case 'description':
        this.onDescriptionAction(actionType, data);
        break;
      default:
        break;
    }
  }

  onDescriptionAction(actionType, data) {
    switch (actionType) {
      default: break;
    }
  }

  render() {
    return (
      <div className="halo-module-instance" style={this.props.style}>
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
