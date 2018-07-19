require('./style/index.less');

const React = require('react');
const Main = require('client/components/main_paged/index');
const BasicProps = require('client/components/basic_props/index');
const LineChart = require('client/components/line_chart/index');
const DetailMinitable = require('client/components/detail_minitable/index');
const FilterModal = require('client/components/filter/index');

const deleteModal = require('client/components/modal_delete/index');
const dissociateFIP = require('./pop/dissociate_fip/index');
const migratePop = require('./pop/migrate/index');
const alarmDetail = require('./pop/alarm_detail/index');

const request = require('./request');
const config = require('./config.json');
const moment = require('client/libs/moment');

const router = require('client/utils/router');
const getStatusIcon = require('../../utils/status_icon');
const utils = require('../../utils/utils');
const csv = require('./pop/csv/index');
const getTime = require('client/utils/time_unification');
const dataUtils = require('./data_utils');

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
      config: config,
      filter: ''
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
    let floatingIP = [];
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
    let ips = item.addresses, ret = [];
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
    let that = this, a = '', b = '';

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
    } else if (nextState.filter) {
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
    let ret;

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
            let flavor = this.findItemByID(this.stores.flavorTypes, item.flavor.id);
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
              let image = this.findItemByID(this.stores.imageTypes, item.image.id);
              return (
                <a data-type="router" href={'/admin/image/' + item.image.id}>
                  {image ? image.name : '(' + item.image.id.substr(0, 8) + ')'}
                </a>
              );
            } else {
              let bootableVolume = item['os-extended-volumes:volumes_attached'] && item['os-extended-volumes:volumes_attached'].length !== 0 ? item['os-extended-volumes:volumes_attached'][0].id : '';
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
            let ips = item.addresses,
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
    let setOption = function(key, data) {
      filters.forEach((filter) => {
        filter.items.forEach((item) => {
          if (item.key === key) {
            item.data = data;
          }
        });
      });
    };

    let imageTypes = [];
    res.imageType.list.forEach((image) => {
      imageTypes.push({
        id: image.id,
        name: image.name
      });
    });
    setOption('image', imageTypes);

    let flavorTypes = [];
    res.flavorType.flavors.forEach((flavor) => {
      flavorTypes.push({
        id: flavor.id,
        name: flavor.name
      });
    });
    setOption('flavor', flavorTypes);

    let statusTypes = [{
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
    this.loadingTable();
    if (params && params[2]) {
      this.getServerByIDInitialize(params[2]);
    } else {
      this.getListInitialize();
    }
  }

  //request: get server by ID
  getServerByID(serverID) {
    this.clearState();

    let table = this.state.config.table;
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

    let _config = this.state.config,
      filter = _config.filter,
      table = _config.table;

    request.getServerByIDInitialize(serverID).then((res) => {
      this.addTypesToStore(res[1]);
      table.data = [res[0].server];
      this.initializeFilter(filter, res[1]);

      let newTable = this.processTableData(table, res[0]);
      this.updateTableData(newTable, res[0]._url, true, () => {
        let pathList = router.getPathList();
        router.replaceState('/admin/' + pathList.slice(1).join('/'), null, null, true);
      });
    });
  }

  //request: get server list
  getInitialListData() {
    this.clearState();

    let pageLimit = localStorage.getItem('page_limit');
    request.getList(pageLimit).then((res) => {
      let table = this.processTableData(this.state.config.table, res);
      this.updateTableData(table, res._url);
    });
  }

  //request: get server list and filter data
  getListInitialize() {
    this.clearState();

    let _config = this.state.config,
      filter = _config.filter,
      table = _config.table;

    let pageLimit = localStorage.getItem('page_limit');
    request.getListInitialize(pageLimit).then((res) => {
      this.addTypesToStore(res[1]);
      this.initializeFilter(filter, res[1]);

      let newTable = this.processTableData(table, res[0]);
      this.updateTableData(newTable, res[0]._url);
    });
  }

  //request: get next list according to given url
  getNextListData(url, refreshDetail) {
    let table = this.state.config.table;
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

    let table = this.state.config.table;
    filterData.limit = localStorage.getItem('page_limit');
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

      let serverID = data.instance,
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
    let newConfig = this.state.config;
    newConfig.table = table;
    newConfig.table.loading = false;

    this.setState({
      config: newConfig
    }, () => {
      this.stores.urls.push(currentUrl.split('/v2.1/')[1]);

      let detail = this.refs.dashboard.refs.detail,
        params = this.props.params;
      if (detail && refreshDetail && params.length > 2) {
        detail.refresh();
      }

      callback && callback();
    });
  }
  setPaginationData(table, res) {
    let pagination = {},
      next = res.servers_links ? res.servers_links[0] : null;

    if (next && next.rel === 'next') {
      pagination.nextUrl = next.href.split('/v2.1/')[1];
    }

    let history = this.stores.urls;

    if (history.length > 0) {
      pagination.prevUrl = history[history.length - 1];
    }
    table.pagination = pagination;

    return table;
  }

  setFloatingIP(table) {
    table.data.forEach((data) => {
      let floatingIP = [];
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

      let history = this.stores.urls,
        url = history.pop();

      this.getNextListData(url, data.refreshDetail);
    }
  }

  loadingTable() {
    let _config = this.state.config;
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

    let dashboard = this.refs.dashboard;
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
      case 'page_limit':
        this.onInitialize();
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
        let url,
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

        let table = this.state.config.table;
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
    let {rows} = data,
      that = this;

    let refresh = () => {
      this.refresh({
        refreshList: true,
        loadingTable: true,
        refreshDetail: true
      });
    };

    switch (key) {
      case 'migrate':
        migratePop({
          rows: rows,
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
            request.deleteItem(rows).then((res) => {
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
    let {rows} = data,
      btnList = refs.btnList,
      btns = btnList.state.btns;

    btnList.setState({
      btns: this.btnListRender(rows, btns)
    });
  }

  btnListRender(rows, btns) {
    let single = rows.length === 1 ? rows[0] : null;
    btns.export_csv.disabled = false;
    let cantMigrate = rows.some((item) => {
      return item.status.toLowerCase() === 'error' || item.status.toLowerCase() === 'error_deleting';
    }) || rows.length === 0;

    for (let key in btns) {
      if(single) {
        let itemStatus = single.status.toLowerCase();
        switch (key) {
          case 'migrate':
            btns[key].disabled = cantMigrate;
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
          default:
            break;
        }
      } else {
        if (key !== 'refresh' && key !== 'export_csv') {
          if(key === 'migrate' && !cantMigrate) {
            btns[key].disabled = false;
          } else {
            btns[key].disabled = true;
          }
        }
      }
      if (key === 'delete') {
        btns[key].disabled = rows.length >= 1 ? false : true;
      }
    }

    return btns;
  }

  onClickDetailTabs(tabKey, refs, data) {
    let {rows} = data;
    let detail = refs.detail;
    let contents = detail.state.contents;
    let syncUpdate = true;

    let isAvailableView = (_rows) => {
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
          let userName, projectName;
          syncUpdate = false;

          request.getPjtAndUserName(rows[0].tenant_id, rows[0].user_id).then((res) => {
            userName = res.user.name;
            projectName = res.project.name;
          }).catch((err) => {
            userName = '';
            projectName = '';
          }).finally(() => {
            let basicPropsItem = this.getBasicPropsItems(rows[0], userName, projectName);
            let falutDetails = this.getFalutDetails(rows[0]);
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
          });
        }
        break;
      case 'monitor':
        if (isAvailableView(rows)) {
          syncUpdate = false;
          let that = this;

          let updateDetailMonitor = function(newContents, loading) {
            detail.setState({
              contents: newContents,
              loading: loading
            });
          };
          let time = data.time;

          let resourceId = rows[0].id,
            telemerty = HALO.configs.telemerty,
            instanceMetricType = ['cpu_util', 'memory.usage', 'disk.read.bytes.rate', 'disk.write.bytes.rate'],
            portMetricType = ['network.incoming.bytes.rate', 'network.outgoing.bytes.rate'],
            diskMetricType = ['disk.device.read.bytes.rate', 'disk.device.write.bytes.rate', 'disk.device.read.requests.rate', 'disk.device.write.requests.rate'],
            hour = telemerty.hour,
            day = telemerty.day,
            week = telemerty.week,
            month = telemerty.month,
            year = telemerty.year;

          let tabItems = [{
            name: __.three_hours,
            key: hour,
            value: hour,
            time: 'hour'
          }, {
            name: __.one_day,
            key: day,
            value: day,
            time: 'day'
          }, {
            name: __.one_week,
            key: week,
            value: week,
            time: 'week'
          }, {
            name: __.one_month,
            key: month,
            value: month,
            time: 'month'
          }, {
            name: __.one_year,
            key: year,
            value: year,
            time: 'year'
          }];

          let granularity = '', key = '';
          if (data.granularity) {
            granularity = data.granularity;
            key = data.key;
          } else {
            granularity = hour;
            key = hour;
            contents[tabKey] = (<div/>);
            updateDetailMonitor(contents, true);
          }

          tabItems.some((ele) => ele.key === key ? (ele.default = true, true) : false);

          let updateContents = (arr) => {
            let chartDetail = {
              key: key,
              item: rows[0],
              data: arr,
              granularity: granularity,
              time: time
            };

            let filterData = dataUtils.getFilterData();
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
                    granularity: tab.value,
                    key: tab.key,
                    time: tab.time
                  });
                }}
                clickParent={(page) => {
                  that.onDetailAction('description', 'chart_zoom', {
                    chartDetail: chartDetail,
                    page: page,
                    that: this
                  });
                }} >
                <FilterModal __={__}
                  data={filterData}
                  value={filterData[0].name}
                  onFilter={this.onFilter.bind(this)}/>
              </LineChart>
            );

            updateDetailMonitor(contents);
          };
          if (data.granularity) {
            updateContents([]);
          }

          let ids = [], diskInsData = [];

          request.getResourceMeasures(resourceId, instanceMetricType, granularity, utils.getTime(time)).then((res) => {
            let arr = res.map((r, index) => ({
              title: utils.getMetricName(instanceMetricType[index]),
              unit: utils.getUnit('instance', instanceMetricType[index], r),
              metricType: instanceMetricType[index],
              color: utils.getTriangleColor(instanceMetricType[index]),
              triangleColor: utils.getTriangleColor(instanceMetricType[index]),
              xAxis: utils.getChartData(r, granularity, utils.getTime(time), instanceMetricType[index]),
              yAxisData: utils.getChartData(r, granularity, utils.getTime(time), instanceMetricType[index], 'instance')
            }));
            diskInsData = arr;
            this.getDiskData(rows[0]['os-extended-volumes:volumes_attached']).then(volDevice => {
              request.getDiskResourceId(volDevice.ids, granularity).then(diskRes => {
                diskMetricType.forEach(type => {
                  diskRes.forEach(_disk => {
                    _disk[0] && ids.push(_disk[0].metrics[type]);
                  });
                });
                if (diskRes.length !== 0) {
                  request.getDiskMeasures(ids, granularity, utils.getTime(time)).then((_r) => {
                    let arrDisk = _r.map((r, index) => ({
                      title: utils.getMetricName(diskMetricType[index % 4], volDevice.volume[parseInt(index / 4, 10)]),
                      metricType: diskMetricType[index % 4],
                      color: utils.getTriangleColor(diskMetricType[index % 4]),
                      triangleColor: utils.getTriangleColor(diskMetricType[index % 4]),
                      unit: utils.getUnit('volume', diskMetricType[index % 4], r),
                      yAxisData: utils.getChartData(r, granularity, utils.getTime(time), diskMetricType[index % 4], 'volume'),
                      xAxis: utils.getChartData(r, granularity, utils.getTime(time), diskMetricType[index % 4])
                    }));
                    diskInsData = arr.concat(arrDisk);
                    request.getNetworkResourceId(resourceId).then(_data => {
                      request.getPort(_data).then(datas => {
                        request.getNetworkResource(granularity, utils.getTime(time), rows[0], datas.datas).then(resourceData => {
                          let portData = resourceData.map((_rd, index) => ({
                            title: utils.getMetricName(portMetricType[index % 2], datas.ips[parseInt(index / 2, 10)]),
                            unit: utils.getUnit('instance', portMetricType[parseInt(index / 2, 10)], _rd),
                            color: utils.getTriangleColor(portMetricType[index % 2]),
                            metricType: portMetricType[index % 2],
                            triangleColor: utils.getTriangleColor(portMetricType[index % 2]),
                            yAxisData: utils.getChartData(_rd, granularity, utils.getTime(time), portMetricType[index % 2], 'instance'),
                            xAxis: utils.getChartData(_rd, granularity, utils.getTime(time), portMetricType[index % 2])
                          }));
                          updateContents(diskInsData.concat(portData));
                        });
                      });
                    });
                  });
                } else {
                  request.getNetworkResourceId(resourceId).then(_data => {
                    request.getPort(_data).then(datas => {
                      request.getNetworkResource(granularity, utils.getTime(time), rows[0], datas.datas).then(resourceData => {
                        let portData = resourceData.map((_rd, index) => ({
                          title: utils.getMetricName(portMetricType[index % 2], datas.ips[parseInt(index / 2, 10)]),
                          unit: utils.getUnit('instance', portMetricType[parseInt(index / 2, 10)], _rd),
                          color: utils.getTriangleColor(portMetricType[index % 2]),
                          metricType: portMetricType[index % 2],
                          triangleColor: utils.getTriangleColor(portMetricType[index % 2]),
                          yAxisData: utils.getChartData(_rd, granularity, utils.getTime(time), portMetricType[index % 2], 'instance'),
                          xAxis: utils.getChartData(_rd, granularity, utils.getTime(time), portMetricType[index % 2])
                        }));
                        updateContents(diskInsData.concat(portData));
                      });
                    });
                  });
                }
              });
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
          syncUpdate = false;
          request.getActionLog(rows[0].id).then(res => {
            let actionItems = this.getActionLogs(res.instanceActions);
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

    if (syncUpdate) {
      detail.setState({
        contents: contents,
        loading: false
      });
    }
  }

  getDiskData(volume) {
    let volDevice, volDeviceId = [], volIds = [], volDevices = [];
    volume && volume.forEach(vol => {
      volIds.push(vol.id);
    });

    return request.getVolumeByIDs(volIds).then(volRes => {
      volRes.forEach(vols => {
        volDevice = vols.list[0].attachments[0].device.split('/');
        volDeviceId.push(vols.list[0].attachments[0].server_id + '-' + volDevice[volDevice.length - 1]);
        volDevices.push(vols.list[0]);
      });

      return {ids: volDeviceId, volume: volDevices};
    });
  }

  onFilter(ele) {
    let filter = utils.getFilterMetric(ele.name).filter,
      rawItem = utils.getFilterMetric(ele.name).rawItem, className;
    filter.forEach(i => {
      className = document.getElementsByClassName(i);
      for (let t = 0; t < className.length; t ++) {
        className[t].style.display = 'block';
      }
    });

    rawItem.forEach(item => {
      className = document.getElementsByClassName(item);
      for (let j = 0; j < className.length; j ++) {
        className[j].style.display = 'none';
      }
    });

    this.setState({
      filter: ele.name
    });
  }

  getActionLogs(item) {
    let tableContent = [];
    item.forEach((ele, index) => {
      let dataObj = {
        request_id: ele.request_id,
        action: __[ele.action],
        start_time: getTime(ele.start_time, true),
        user_id: ele.user_id,
        message: ele.message || '-'
      };
      tableContent.push(dataObj);
    });
    let tableConfig = {
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

  getBasicPropsItems(item, userName, projectName) {
    let flavor = this.findItemByID(this.stores.flavorTypes, item.flavor.id),
      image = this.findItemByID(this.stores.imageTypes, item.image.id),
      fixedIps = (function() {
        let ips = item.addresses,
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

    let getImage = function() {
      if(item.image) {
        return <a data-type="router" href={'/admin/image/' + item.image.id}>
          {image ? image.name : '(' + item.image.id.substr(0, 8) + ')'}
        </a>;
      } else {
        let bootableVolume = item['os-extended-volumes:volumes_attached'] && item['os-extended-volumes:volumes_attached'].length !== 0 ? item['os-extended-volumes:volumes_attached'][0].id : '';
        return <a data-type="router" href={'/admin/volume/' + bootableVolume}>
          {bootableVolume !== '' ? '(' + bootableVolume.substr(0, 8) + ')' : ''}
        </a>;
      }
    };

    let items = [{
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
      title: __.user_name,
      type: 'copy',
      content: userName
    }, {
      title: __.user + __.id,
      type: 'copy',
      content: item.user_id
    }, {
      title: __.project_name,
      type: 'copy',
      content: projectName
    }, {
      title: __.project_id,
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
      case 'chart_zoom':
        alarmDetail({
          type: 'chart',
          item: data
        });
        break;
      default:
        break;
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
