require('./style/index.less');

//react components
var React = require('react');
var Main = require('client/components/main/index');

//detail components
var BasicProps = require('client/components/basic_props/index');
var RelatedSources = require('client/components/related_sources/index');
var RelatedSnapshot = require('client/components/related_snapshot/index');
var ConsoleOutput = require('../../components/console_output/index');
var VncConsole = require('../../components/vnc_console/index');
var DetailMinitable = require('client/components/detail_minitable/index');
var LineChart = require('client/components/line_chart/index');
var {Button} = require('client/uskin/index');

//pop modals
var deleteModal = require('client/components/modal_delete/index');
var createInstance = require('./pop/create_instance/index');
var poweronInstance = require('./pop/poweron/index');
var shutoffInstance = require('./pop/shutoff/index');
var rebootInstance = require('./pop/reboot/index');
var associateFip = require('./pop/associate_fip/index');
var attachVolume = require('./pop/attach_volume/index');
var joinNetwork = require('./pop/join_network/index');
var instSnapshot = require('./pop/inst_snapshot/index');
var dissociateFIP = require('./pop/dissociate_fip/index');
var changeSecurityGrp = require('./pop/change_security_grp/index');
var changePassword = require('./pop/change_password/index');
var detachVolume = require('./pop/detach_volume/index');
var detachNetwork = require('./pop/detach_network/index');
var resizeInstance = require('./pop/resize/index');
var deleteInstance = require('./pop/delete/index');

var request = require('./request');
var config = require('./config.json');
var moment = require('client/libs/moment');
var __ = require('locale/client/dashboard.lang.json');
var router = require('client/utils/router');
var msgEvent = require('client/applications/dashboard/cores/msg_event');
var notify = require('client/applications/dashboard/utils/notify');
var getStatusIcon = require('../../utils/status_icon');
var unitConverter = require('client/utils/unit_converter');
var getTime = require('client/utils/time_unification');

class Model extends React.Component {

  constructor(props) {
    super(props);

    moment.locale(HALO.configs.lang);

    this.state = {
      config: config
    };

    ['onInitialize', 'onAction', 'changeDefaultTab'].forEach((m) => {
      this[m] = this[m].bind(this);
    });
  }

  componentWillMount() {
    function shouldRefresh(msg) {
      if (msg.resource_type === 'instance' && (msg.action === 'power_on' || msg.action === 'power_off') && msg.stage === 'start') {
        return false;
      }
      return true;
    }

    this.tableColRender(this.state.config.table.column);

    msgEvent.on('dataChange', (data) => {
      if (this.props.style.display !== 'none') {
        switch (data.resource_type) {
          case 'instance':
          case 'volume':
          case 'floatingip':
          case 'port':
          case 'image':
            if (shouldRefresh(data)) {
              this.refresh({
                detailRefresh: true
              }, false);
            }

            if (data.action.indexOf('delete') > -1 && data.stage === 'end' && data.resource_id === router.getPathList()[2]) {
              router.replaceState('/dashboard/instance');
            }
            break;
          default:
            break;
        }
      }
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.style.display === 'none' && !nextState.config.table.loading) {
      return false;
    }
    return true;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.style.display !== 'none' && this.props.style.display === 'none') {
      if (this.state.config.table.loading) {
        this.loadingTable();
      } else {
        this.getTableData(false);
      }
    }
  }

  getImageLabel(item) {
    var style = null,
      label = '';
    var imgURL = HALO.settings.default_image_url;
    if (imgURL) {
      style = {
        background: `url("${imgURL}") 0 0 no-repeat`,
        backgroundSize: '20px 20px'
      };
    }

    if(item.image && item.image.id) {
      label = item.image.image_label ? item.image.image_label.toLowerCase() : '';

      return (
        <div>
          <i className={'icon-image-default ' + label} style={style}/>
          <a data-type="router" href={'/dashboard/image/' + item.image.id}>{item.image.name}</a>
        </div>
      );
    } else if(item.volume[0] && item.volume[0].volume_image_metadata) {
      var imageData = item.volume[0].volume_image_metadata;
      label = imageData.image_label ? imageData.image_label.toLowerCase() : '';

      return (
        <div>
          <i className={'icon-image-default ' + label} style={style}/>
          <a data-type="router" href={'/dashboard/image/' + imageData.image_id}>{imageData.image_name}</a>
        </div>
      );
    }
  }

  tableColRender(columns) {
    columns.map((column) => {
      switch (column.key) {
        case 'image':
          column.render = (col, item, i) => {
            return this.getImageLabel(item);
          };
          break;
        case 'ip_address':
          column.render = (col, item, i) => {
            var arr = [],
              count = 0;
            for (var n in item.addresses) {
              for (var addr of item.addresses[n]) {
                if (addr.version === 4 && addr['OS-EXT-IPS:type'] === 'fixed') {
                  if (addr.port) {
                    if (count !== 0) {
                      arr.push(', ');
                    }
                    arr.push(<a key={addr.port.id} data-type = "router" href={'/dashboard/port/' + addr.port.id}>{addr.addr}</a>);
                    count++;
                  }
                }
              }
            }
            return <div>{arr}</div>;
          };
          break;
        case 'floating_ip':
          column.render = (col, item, i) => {
            return (item.floating_ip && item.floating_ip.port_id !== null) ?
              <span>
                <i className="glyphicon icon-floating-ip" />
                <a data-type="router" href={'/dashboard/floating-ip/' + item.floating_ip.id}>
                  {item.floating_ip.floating_ip_address}
                </a>
              </span> : '';
          };
          break;
        case 'flavor':
          column.render = (col, item, i) => {
            var ret = '';
            if (item.flavor.name) {
              let ram = unitConverter(item.flavor.ram, 'MB');
              ret = item.flavor.vcpus + 'CPU / ' + ram.num + ram.unit + ' / ' + item.flavor.disk + 'GB';
            } else {
              ret = '(' + item.flavor.id.substr(0, 8) + ')';
            }

            return ret;
          };
          break;
        default:
          break;
      }
    });
  }

  onInitialize(params) {
    this.getTableData(false);
  }

  getTableData(forceUpdate, detailRefresh) {
    request.getList(forceUpdate).then((res) => {
      var table = this.state.config.table;
      table.data = res;
      table.loading = false;

      var detail = this.refs.dashboard.refs.detail;
      if (detail && detail.state.loading) {
        detail.setState({
          loading: false
        });
      }

      this.setState({
        config: config
      }, () => {
        if (detail && detailRefresh) {
          detail.refresh();
        }
      });
    });
  }

  onAction(field, actionType, refs, data) {
    switch (field) {
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

  onClickTable(actionType, refs, data) {
    switch (actionType) {
      case 'check':
        this.onClickTableCheckbox(refs, data);
        break;
      default:
        break;
    }
  }

  onClickBtnList(key, refs, data) {
    var {rows} = data,
      that = this;

    switch (key) {
      case 'create':
        createInstance();
        break;
      case 'vnc_console':
        var url = '/api/v1/' + HALO.user.projectId + '/servers/' + rows[0].id + '/vnc?region=' + HALO.current_region;
        window.open(url, '_blank', 'width=780, height=436, left=0, top=0, resizable=yes, toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=yes, resizable=no, copyhistory=no').blur();
        break;
      case 'power_on':
        poweronInstance(rows, null, (res) => {
          rows.forEach((ele) => {
            ele.status = 'powering_on';
          });

          //change status of current data
          this.setState({
            config: this.state.config
          });

          //change button status
          this.onClickTableCheckbox(this.refs.dashboard.refs, { rows: rows });
        });
        break;
      case 'power_off':
        shutoffInstance(rows, null, (res) => {
          rows.forEach((ele) => {
            ele.status = 'powering_off';
          });

          this.setState({
            config: this.state.config
          });

          this.onClickTableCheckbox(this.refs.dashboard.refs, { rows: rows });
        });
        break;
      case 'refresh':
        this.refresh({
          tableLoading: true,
          detailLoading: true,
          clearState: true,
          detailRefresh: true
        }, true);
        break;
      case 'reboot':
        rebootInstance(rows, null, (res) => {
          rows.forEach((ele) => {
            ele.status = 'rebooting';
          });

          this.setState({
            config: this.state.config
          });

          this.onClickTableCheckbox(this.refs.dashboard.refs, { rows: rows });
        });
        break;
      case 'instance_snapshot':
        instSnapshot(rows[0]);
        break;
      case 'resize':
        resizeInstance(rows[0]);
        break;
      case 'assc_floating_ip':
        associateFip(rows[0]);
        break;
      case 'dssc_floating_ip':
        dissociateFIP(rows[0]);
        break;
      case 'join_ntw':
        joinNetwork(rows[0], null, function() {
          that.refresh({
            detailRefresh: true
          }, true);
          notify({
            action: 'associate',
            resource_id: rows[0].id,
            resource_type: 'port',
            stage: 'end'
          });
        });
        break;
      case 'chg_security_grp':
        changeSecurityGrp(rows[0], null, () => {
          that.refresh(null, true);
          notify({
            resource_type: 'security_group',
            stage: 'end',
            action: 'modify',
            resource_id: rows[0].id
          });
        });
        break;
      case 'chg_pwd':
        changePassword(rows[0], null, () => {
          that.refresh(null, true);
        });
        break;
      case 'add_volume':
        request.getVolumeList(!HALO.volume_types).then((res) => {
          if (!HALO.volume_types) {
            HALO.volume_types = [];
            res[1].volume_types.forEach((type) => {
              HALO.volume_types.push(type.name);
            });
          }
          attachVolume({
            rawItem: rows[0],
            volumes: res[0].volume,
            types: HALO.volume_types
          }, null, function() {});
        });
        break;
      case 'rmv_volume':
        detachVolume({
          rawItem: rows[0]
        }, false);
        break;
      case 'terminate':
        deleteInstance(rows);
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
    var allActive = true;
    rows.forEach((ele, i) => {
      var thisState = ele.status.toLowerCase() === 'active' ? true : false;
      allActive = allActive && thisState;
    });

    var status;
    if (rows.length > 0) {
      status = rows[0].status.toLowerCase();
    }

    for (let key in btns) {
      switch (key) {
        case 'vnc_console':
        case 'chg_security_grp':
        case 'chg_pwd':
          btns[key].disabled = (rows.length === 1 && status === 'active') ? false : true;
          break;
        case 'power_on':
          btns[key].disabled = rows.length > 0 && !rows.some((ele) => ele.status.toLowerCase() !== 'shutoff') ? false : true;
          break;
        case 'power_off':
        case 'reboot':
          btns[key].disabled = rows.length > 0 && !rows.some((ele) => ele.status.toLowerCase() !== 'active') ? false : true;
          break;
        case 'instance_snapshot':
        case 'resize':
        case 'join_ntw':
          btns[key].disabled = (rows.length === 1 && (status === 'active' || status === 'shutoff')) ? false : true;
          break;
        case 'assc_floating_ip':
          btns[key].disabled = (rows.length === 1 && status === 'active' && !rows[0].floating_ip) ? false : true;
          break;
        case 'dssc_floating_ip':
          btns[key].disabled = (rows.length === 1 && rows[0].floating_ip) ? false : true;
          break;
        case 'rmv_volume':
          btns[key].disabled = (rows.length === 1 && rows[0].volume.length !== 0) ? false : true;
          break;
        case 'add_volume':
          btns[key].disabled = (rows.length === 1) ? false : true;
          break;
        case 'terminate':
          btns[key].disabled = (rows.length > 0) ? false : true;
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
    var syncUpdate = true;

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

    var itemStatus = rows[0].status.toLowerCase();
    switch (tabKey) {
      case 'description':
        if (isAvailableView(rows)) {
          var basicPropsItem = this.getBasicPropsItems(rows[0]);
          var relatedSourcesItem = this.getRelatedSourcesItems(rows[0]);
          var relatedSnapshotItems = this.getRelatedSnapshotItems(rows[0].instance_snapshot);
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
              <RelatedSources
                title={__.related + __.sources}
                tabKey={'description'}
                defaultUnfold={true}
                items={relatedSourcesItem}
                rawItem={rows[0]}
                onAction={this.onDetailAction.bind(this)}
                __={__} />
              <RelatedSnapshot
                title={__.related_image}
                btnConfig={{
                  value: __.create + __.snapshot,
                  type: 'create',
                  actionType: 'create_related_snapshot',
                  disabled: !(itemStatus === 'active' || itemStatus === 'shutoff')
                }}
                defaultUnfold={true}
                tabKey={'description'}
                items={relatedSnapshotItems ? relatedSnapshotItems : []}
                rawItem={rows[0]}
                onAction={this.onDetailAction.bind(this)}
                actionType={{
                  create: 'create_related_instance',
                  delete: 'delete_related_snapshot'
                }}
                noItemAlert={__.no_related + __.instance + __.snapshot} />
            </div>
          );
        }
        break;
      case 'console_output':
        if (isAvailableView(rows)) {
          var serverId = rows[0].id,
            requestData = {
              'os-getConsoleOutput': {
                'length': -1
              }
            };

          contents[tabKey] = (
            <ConsoleOutput
              refresh={true}
              url={'/proxy/nova/v2.1/' + HALO.user.projectId + '/servers/' + serverId + '/action'}
              requestData={requestData}
              moduleID="instance"
              tabKey="console_output"
              data-id={serverId} />
          );
        }
        break;
      case 'vnc_console':
        if (isAvailableView(rows)) {
          syncUpdate = false;
          var asyncTabKey = tabKey;

          var updateDetail = function(newContents) {
            detail.setState({
              contents: newContents,
              loading: false
            });
          };

          //open detail without delaying
          contents[asyncTabKey] = <VncConsole />;
          updateDetail(contents);

          request.getVncConsole(rows[0]).then((res) => {
            contents[asyncTabKey] = (
              <VncConsole
                src={res.console.url}
                data-id={rows[0].id}
                loading={false} />
            );
            updateDetail(contents);
          }, () => {
            contents[asyncTabKey] = (<div />);
            updateDetail(contents);
          });
        }
        break;
      case 'monitor':
        if (isAvailableView(rows)) {
          syncUpdate = false;
          var asyncMonitorTabKey = tabKey;

          var updateDetailMonitor = function(newContents) {
            detail.setState({
              contents: newContents,
              loading: false
            });
          };

          //open detail without delaying
          contents[asyncMonitorTabKey] = <LineChart/>;
          updateDetailMonitor(contents);

          var resourceId = rows[0].id,
            metricType = ['cpu_util', 'memory.usage', 'disk.read.bytes.rate', 'disk.write.bytes.rate'],
            granularity = '300',
            _data = [], chartData = [], _time = [], chartTime = [];
          var tabItems = [{
            name: __.three_hours,
            key: '300',
            default: true
          }, {
            name: __.one_day,
            key: '900'
          }, {
            name: __.one_week,
            key: '3600'
          }, {
            name: __.one_month,
            key: '21600'
          }];
          request.getReousrceMeasures(resourceId, metricType, granularity).then((res) => {
            res.forEach((_d, i) => {
              _data = [];
              _d.forEach(d => {
                _time.push(moment(d[0]).month() + '-' + moment(d[0]).date() + ' ' + moment(d[0]).hour() + ':' + moment(d[0]).minute() + '0');
                if (i === 0 || i === 1) {
                  _data.push(d[2].toFixed(2) * 100);
                } else {
                  _data.push(d[2].toFixed(2));
                }
              });
              chartData.push(_data);
              chartTime.push(_time);
              _time = [];
            });
            contents[asyncMonitorTabKey] = (
              <LineChart
                __={__}
                item={rows[0]}
                title={['cpu_util', 'memory_utils', 'disk_read', 'disk_write']}
                unit={['%', '%', 'B/s', 'B/s']}
                data={chartData}
                chartTime={chartTime}
                granularity={granularity}
                tabItems={tabItems}
                clickTabs={this.clickTabs.bind(this)}>
                <Button value={__.create}/>
              </LineChart>
            );
            updateDetailMonitor(contents);
          }, () => {
            contents[asyncMonitorTabKey] = (<LineChart
              __={__}
              item={rows[0]}
              title={['cpu_util', 'memory_utils', 'disk_read', 'disk_write']}
              unit={['%', '%', 'B/s', 'B/s']}
              data={[[], [], [], []]}
              chartTime={chartTime}
              granularity={granularity}
              tabItems={tabItems}
              clickTabs={this.clickTabs.bind(this)}/>);
            updateDetailMonitor(contents);
          });
        }
        break;
      case 'alarm':
        if (isAvailableView(rows)) {
          var alarmItems = this.getAlarmItems(rows[0]);
          contents[tabKey] = (
            <DetailMinitable
              __={__}
              title={__.alarm}
              defaultUnfold={true}
              tableConfig={alarmItems ? alarmItems : []} />
          );
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

  changeDefaultTab(tabs, tab) {
    tabs.forEach((t) => {
      t.default = (t.key === tab.key) ? true : false;
    });

    return tabs;
  }

  clickTabs(e, tabItem, item) {
    var detail = this.refs.dashboard.refs.detail,
      contents = detail.state.contents,
      monitor = 'monitor',
      resourceId = item.id,
      tabItems = [],
      metricType = ['cpu_util', 'memory.usage', 'disk.read.bytes.rate', 'disk.write.bytes.rate'],
      granularity = tabItem.key,
      _data = [], chartData = [], _time = [], chartTime = [];

    tabItems = [{
      name: __.three_hours,
      key: '300'
    }, {
      name: __.one_day,
      key: '900'
    }, {
      name: __.one_week,
      key: '3600'
    }, {
      name: __.one_month,
      key: '21600'
    }];

    this.changeDefaultTab(tabItems, tabItem);

    request.getReousrceMeasures(resourceId, metricType, granularity).then((res) => {
      res.forEach((data, i) => {
        _data = [];
        data.forEach(d => {
          _time.push(moment(d[0]).month() + '-' + moment(d[0]).date() + ' ' + moment(d[0]).hour() + ':' + moment(d[0]).minute() + '0');
          if (i === 0 || i === 1) {
            _data.push(d[2].toFixed(2) * 100);
          } else {
            _data.push(d[2].toFixed(2));
          }
        });
        chartData.push(_data);
        chartTime.push(_time);
        _time = [];
      });
      contents[monitor] = (
        <LineChart
          __={__}
          item={item}
          title={['cpu_util', 'memory_utils', 'disk_read', 'disk_write']}
          unit={['%', '%', 'B/s', 'B/s']}
          data={chartData}
          chartTime={chartTime}
          tabItems={tabItems}
          granularity={granularity}
          clickTabs={this.clickTabs.bind(this)}>
          <Button value={__.create}/>
        </LineChart>
      );
      detail.setState({
        contents: contents,
        loading: false
      });
    });
  }

  getAlarmItems(item) {
    var tableContent = [];
    item.alarm.forEach((element, index) => {
      if (element.type === 'gnocchi_resources_threshold' && element.gnocchi_resources_threshold_rule.resource_type === 'instance_disk') {
        var dataObj = {
          id: index + 1,
          name: item.name,
          enabled: <span style={element.enabled ? {color: '#1eb9a5'} : {}}>{element.enabled ? __.enabled : __.closed}</span>,
          state: element.state === 'insufficient data' ? getStatusIcon('insufficient_data') : getStatusIcon(element.state),
          created_at: getTime(element.timestamp, true)
        };
        tableContent.push(dataObj);
      }
    });

    var tableConfig = {
      column: [{
        title: __.name,
        key: 'name',
        dataIndex: 'name'
      }, {
        title: __.enable + __.status,
        key: 'enabled',
        dataIndex: 'enabled'
      }, {
        title: __.status,
        key: 'state',
        dataIndex: 'state'
      }, {
        title: __.create + __.time,
        key: 'created_at',
        dataIndex: 'created_at'
      }],
      data: tableContent,
      dataKey: 'id',
      hover: true
    };

    return tableConfig;
  }

  getBasicPropsItems(item) {
    var flavor = '';
    if (item.flavor.name) {
      let ram = unitConverter(item.flavor.ram, 'MB');
      flavor = item.flavor.vcpus + 'CPU / ' + ram.num + ram.unit + ' / ' + item.flavor.disk + 'GB';
    } else {
      flavor = '(' + item.flavor.id.substr(0, 8) + ')';
    }

    var items = [{
      title: __.name,
      content: item.name || '(' + item.id.substring(0, 8) + ')',
      type: 'editable'
    }, {
      title: __.id,
      content: item.id
    }, {
      title: __.floating_ip,
      content: item.floating_ip ?
        <span>
          <i className="glyphicon icon-floating-ip" />
          <a data-type="router" href={'/dashboard/floating-ip/' + item.floating_ip.id}>
            {item.floating_ip.floating_ip_address}
          </a>
        </span> : '-'
    }, {
      title: __.image,
      content: this.getImageLabel(item)
    }, {
      title: __.flavor,
      content: flavor
    }, {
      title: __.keypair,
      content: item.keypair ?
        <span>
          <i className="glyphicon icon-keypair" />
          <a data-type="router" href="/dashboard/keypair">{item.keypair.name}</a>
        </span> : '-'
    }, {
      title: __.status,
      content: getStatusIcon(item.status)
    }, {
      title: __.create + __.time,
      type: 'time',
      content: item.created
    }];

    if (HALO.settings.enable_approval) {
      var metadata = item.metadata;
      items.push({
        title: __.owner,
        content: metadata.owner ? metadata.owner : '-'
      }, {
        title: __.usage,
        content: metadata.usage ? metadata.usage : '-'
      });
    }

    return items;
  }

  getRelatedSourcesItems(items) {
    var attchVolumes = [];
    items.volume.forEach((volume, i) => {
      var vid = '(' + volume.id.slice(0, 8) + ')',
        vname = volume.name || vid;
      attchVolumes.push({
        key: volume.name,
        data: <a data-type="router" href={'/dashboard/volume/' + volume.id}>
            {vname + ' ( ' + volume.volume_type + ' | ' + volume.size + 'GB )'}
          </a>,
        childItem: volume
      });
    });

    var networks = [];
    var count = 0;
    for (let key in items.addresses) {
      let floatingIp;
      for (let item of items.addresses[key]) {
        if (item['OS-EXT-IPS:type'] === 'floating') {
          floatingIp = {};
          floatingIp.addr = item.addr;
          floatingIp.id = items.floating_ip.id;
        }
      }

      for (let item of items.addresses[key]) {
        if (item['OS-EXT-IPS:type'] === 'fixed' && item.port) {
          let securityGroups = [];
          for (let i in item.security_groups) {
            if (i > 0) {
              securityGroups.push(<span key={'dot' + i}>{', '}</span>);
            }
            securityGroups.push(
              <a key={i} data-type="router" href={'/dashboard/security-group/' + item.security_groups[i].id}>
                {item.security_groups[i].name}
              </a>
            );
          }

          networks.push({
            port: <a data-type="router" href={'/dashboard/port/' + item.port.id}>
                {item.addr}
              </a>,
            subnet: <a data-type="router" href={'/dashboard/subnet/' + item.subnet.id}>{item.subnet.name || '(' + item.subnet.id.substring(0, 8) + ')'}</a>,
            security_group: securityGroups,
            floating_ip: floatingIp ?
              <a data-type="router" href={'/dashboard/floating-ip/' + floatingIp.id}>{floatingIp.addr}</a> : '-',
            __renderKey: count,
            childItem: item
          });
          count++;
        }
      }
    }

    var data = [{
      title: __.volume,
      key: 'volume',
      content: attchVolumes,
      icon: 'volume'
    }, {
      title: __.networks,
      key: 'network',
      type: 'mini-table',
      content: {
        column: [{
          title: __.port,
          key: 'port',
          dataIndex: 'port'
        }, {
          title: __.subnet,
          key: 'subnet',
          dataIndex: 'subnet'
        }, {
          title: __.security + __.group,
          key: 'security_group',
          dataIndex: 'security_group'
        }, {
          title: __.floating_ip,
          key: 'floating_ip',
          dataIndex: 'floating_ip'
        }],
        data: networks,
        dataKey: '__renderKey'
      }
    }];

    return data;
  }

  getRelatedSnapshotItems(items) {
    var data = [];
    items.forEach((item) => {
      var size = unitConverter(item.size);
      data.push({
        title: item.created_at,
        name: <a data-type="router" href={'/dashboard/image-snapshot/' + item.id}>{item.name}</a>,
        size: size.num + ' ' + size.unit,
        time: item.created_at,
        status: getStatusIcon(item.status),
        createIcon: 'instance',
        childItem: item
      });
    });

    return data;
  }

  refresh(data, forceUpdate) {
    if (data) {
      var path = router.getPathList();
      if (path[2]) {
        if (data.detailLoading) {
          this.refs.dashboard.refs.detail.loading();
        }
      } else {
        if (data.tableLoading) {
          this.loadingTable();
        }
        if (data.clearState) {
          this.refs.dashboard.clearState();
        }
      }
    }

    this.getTableData(forceUpdate, data ? data.detailRefresh : false);
  }

  loadingTable() {
    var _config = this.state.config;
    _config.table.loading = true;

    this.setState({
      config: _config
    });
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
    var that = this;
    switch (actionType) {
      case 'edit_name':
        var {
          rawItem, newName
        } = data;
        request.editServerName(rawItem, newName).then((res) => {
          notify({
            resource_type: 'instance',
            stage: 'end',
            action: 'modify',
            resource_id: rawItem.id
          });
          this.refresh({
            detailRefresh: true
          }, true);
        });
        break;
      case 'create_volume':
        request.getVolumeList(!HALO.volume_types).then((res) => {
          if (!HALO.volume_types) {
            HALO.volume_types = [];
            res[1].volume_types.forEach((type) => {
              HALO.volume_types.push(type.name);
            });
          }
          attachVolume({
            rawItem: data.rawItem,
            volumes: res[0].volume,
            types: HALO.volume_types
          }, null, function() {});
        });
        break;
      case 'delete_volume':
        detachVolume(data, true);
        break;
      case 'create_network':
        joinNetwork(data.rawItem, null, function() {
          that.refresh({
            detailRefresh: true
          }, true);
          notify({
            action: 'associate',
            resource_id: data.rawItem.id,
            resource_type: 'port',
            stage: 'end'
          });
        });
        break;
      case 'delete_network':
        detachNetwork(data, null, function() {
          that.refresh({
            detailRefresh: true
          }, true);
          notify({
            resource_name: data.childItem.addr,
            stage: 'end',
            action: 'delete_interface',
            resource_type: 'port',
            resource_id: data.rawItem.id
          });
        });
        break;
      case 'create_related_instance':
        createInstance(data.childItem, null, function() {
          router.pushState('/dashboard/instance');
        });
        break;
      case 'create_related_snapshot':
        instSnapshot(data.rawItem);
        break;
      case 'delete_related_snapshot':
        deleteModal({
          __: __,
          action: 'terminate',
          type: 'inst_snapshot',
          data: [data.childItem],
          onDelete: function(_data, cb) {
            request.deleteSnapshot(data.childItem).then(() => {
              that.refresh({
                detailRefresh: true
              }, true);
            });
            cb(true);
          }
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
          config={this.state.config}
          params={this.props.params}
          getStatusIcon={getStatusIcon}
          __={__}
        />
      </div>
    );
  }
}

module.exports = Model;
