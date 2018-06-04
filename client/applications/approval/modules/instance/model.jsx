require('./style/index.less');

//react components
const React = require('react');
const Main = require('client/components/main/index');

//detail components
const BasicProps = require('client/components/basic_props/index');
const RelatedSources = require('client/components/related_sources/index');
const RelatedSnapshot = require('client/components/related_snapshot/index');
const ConsoleOutput = require('../../components/console_output/index');
const applyInstance = require('./pop/apply_instance/index');
const VncConsole = require('../../components/vnc_console/index');
const DetailMinitable = require('client/components/detail_minitable/index');
const LineChart = require('client/components/line_chart/index');
const {Button} = require('client/uskin/index');

//pop modals
const deleteModal = require('client/components/modal_delete/index');
const poweronInstance = require('./pop/poweron/index');
const shutoffInstance = require('./pop/shutoff/index');
const rebootInstance = require('./pop/reboot/index');
const associateFip = require('./pop/associate_fip/index');
const attachVolume = require('./pop/attach_volume/index');
const joinNetwork = require('./pop/join_network/index');
const instSnapshot = require('./pop/inst_snapshot/index');
const dissociateFIP = require('./pop/dissociate_fip/index');
const changeSecurityGrp = require('./pop/change_security_grp/index');
const detachVolume = require('./pop/detach_volume/index');
const detachNetwork = require('./pop/detach_network/index');
const resizeInstance = require('./pop/resize/index');
const deleteInstance = require('./pop/delete/index');
const changeOwner = require('./pop/change_owner/index');
const changeUsage = require('./pop/change_usage/index');
const createAlarm = require('../alarm/pop/create/index');

const request = require('./request');
const config = require('./config.json');
const moment = require('client/libs/moment');

const router = require('client/utils/router');
const msgEvent = require('client/applications/approval/cores/msg_event');
const notify = require('client/applications/approval/utils/notify');
const getStatusIcon = require('../../utils/status_icon');
const unitConverter = require('client/utils/unit_converter');
const getTime = require('client/utils/time_unification');
const utils = require('../alarm/utils');
const timeUtils = require('../../utils/utils');
const getOsCommonName = require('client/utils/get_os_common_name');

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
      }, {
        name: ['alarm'],
        key: 'alarm'
      });
    }

    this.state = {
      config: config
    };

    ['onInitialize', 'onAction'].forEach((m) => {
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
              }, true);
            }

            if (data.action.indexOf('delete') > -1 && data.stage === 'end' && data.resource_id === router.getPathList()[2]) {
              router.replaceState('/approval/instance');
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
    let label = getOsCommonName(item);
    let style = null;

    let imgURL = HALO.settings.default_image_url;
    if (imgURL) {
      style = {
        background: `url("${imgURL}") 0 0 no-repeat`,
        backgroundSize: '20px 20px'
      };
    }
    return (
      <div>
        <i className={'icon-image-default ' + label} style={style}/>
        <span>{item.image.name}</span>
      </div>
    );
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
            let arr = [],
              count = 0;
            for (let n in item.addresses) {
              for (let addr of item.addresses[n]) {
                if (addr.version === 4 && addr['OS-EXT-IPS:type'] === 'fixed') {
                  if (addr.port) {
                    if (count !== 0) {
                      arr.push(', ');
                    }
                    arr.push(<span key={addr.port.id}>{addr.addr}</span>);
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
            return item.floating_ip ?
              <span>
                <i className="glyphicon icon-floating-ip" />
                <span>
                  {item.floating_ip.floating_ip_address}
                </span>
              </span> : '';
          };
          break;
        case 'flavor':
          column.render = (col, item, i) => {
            let ret = '';
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
      let table = this.state.config.table;
      table.data = res;
      table.loading = false;

      let detail = this.refs.dashboard.refs.detail;
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

  closeDetail() {
    let detail = this.refs.dashboard.refs.detail;
    detail.onClose();
  }

  onClickBtnList(key, refs, data) {
    let {rows} = data,
      that = this;

    switch (key) {
      case 'apply_instance':
        applyInstance();
        break;
      case 'vnc_console':
        let url = '/api/v1/' + HALO.user.projectId + '/servers/' + rows[0].id + '/vnc?region=' + HALO.current_region;
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
      case 'chg_owner':
        changeOwner(rows[0], null, () => {
          that.closeDetail();
          that.refresh(null, true);
        });
        break;
      case 'chg_usage':
        changeUsage(rows[0], null, () => {
          that.refresh({
            detailRefresh: true
          }, true);
        });
        break;
      case 'terminate':
        deleteInstance(rows);
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
    let allActive = true;
    rows.forEach((ele, i) => {
      let thisState = ele.status.toLowerCase() === 'active' ? true : false;
      allActive = allActive && thisState;
    });

    let status;
    if (rows.length > 0) {
      status = rows[0].status.toLowerCase();
    }

    for (let key in btns) {
      switch (key) {
        case 'vnc_console':
        case 'chg_security_grp':
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
        case 'chg_owner':
          btns[key].disabled = (rows.length === 1) ? false : true;
          break;
        case 'chg_usage':
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

    let updateDetail = function(newContents) {
      detail.setState({
        contents: newContents,
        loading: false
      });
    };

    let itemStatus = rows[0].status.toLowerCase();
    switch (tabKey) {
      case 'description':
        if (isAvailableView(rows)) {
          let basicPropsItem = this.getBasicPropsItems(rows[0]);
          let falutDetails = this.getFalutDetails(rows[0]);
          let relatedSourcesItem = this.getRelatedSourcesItems(rows[0]);
          let relatedSnapshotItems = this.getRelatedSnapshotItems(rows[0].instance_snapshot);
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
                  value: __.apply_ + __.snapshot,
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
                  delete: 'delete_related_snapshot'
                }}
                noItemAlert={__.no_related + __.instance + __.snapshot} />
            </div>
          );
        }
        break;
      case 'console_output':
        if (isAvailableView(rows)) {
          let serverId = rows[0].id,
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
          let asyncTabKey = tabKey;

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
          let that = this;

          let updateDetailMonitor = function(newContents, loading) {
            detail.setState({
              contents: newContents,
              loading: loading
            });
          };
          let time = data.time;

          let resourceId = rows[0].id,
            instanceMetricType = ['cpu_util', 'memory.usage', 'disk.read.bytes.rate', 'disk.write.bytes.rate'],
            portMetricType = ['network.incoming.bytes.rate', 'network.outgoing.bytes.rate'];
          let tabItems = [{
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
                start={timeUtils.getTime(time)}
                clickTabs={(e, tab, item) => {
                  that.onClickDetailTabs('monitor', refs, {
                    rows: rows,
                    granularity: tab.key,
                    time: tab.time
                  });
                }} >
                <Button value={__.create + __.alarm} onClick={this.onDetailAction.bind(this, 'description', 'create_alarm', { rawItem: rows[0] })}/>
              </LineChart>
            );

            updateDetailMonitor(contents);
          };
          if (data.granularity) {
            updateContents([]);
          }
          request.getResourceMeasures(resourceId, instanceMetricType, granularity, timeUtils.getTime(time)).then((res) => {
            let arr = res.map((r, index) => ({
              title: utils.getMetricName(instanceMetricType[index]),
              unit: utils.getUnit('instance', instanceMetricType[index]),
              yAxisData: utils.getChartData(r, granularity, timeUtils.getTime(time), 'instance'),
              xAxis: utils.getChartData(r, granularity, timeUtils.getTime(time))
            }));
            request.getNetworkResourceId(resourceId).then(_data => {
              const addresses = rows[0].addresses;
              let ips = [], _datas = [];
              for (let key in addresses) {
                addresses[key].filter((addr) => addr['OS-EXT-IPS:type'] === 'fixed').some((addrItem) => {
                  _data.forEach(_portData => {
                    if (addrItem.port.id.substr(0, 11) === _portData.name.substr(3)) {
                      ips.push(addrItem.port.fixed_ips[0].ip_address);
                      _datas.push(_portData);
                    }
                  });
                });
              }
              request.getNetworkResource(granularity, timeUtils.getTime(time), rows[0], _datas).then(resourceData => {
                let portArr = resourceData.map((_rd, index) => ({
                  title: ips[parseInt(index / 2, 10)] + ' ' + utils.getMetricName(portMetricType[index % 2]),
                  unit: utils.getUnit('instance', portMetricType[parseInt(index / 2, 10)]),
                  yAxisData: utils.getChartData(_rd, granularity, timeUtils.getTime(time), 'instance'),
                  xAxis: utils.getChartData(_rd, granularity, timeUtils.getTime(time))
                }));
                updateContents(arr.concat(portArr));
              }).catch(error => {
                updateContents([{}]);
              });
            }).catch(error => {
              updateContents([{}]);
            });
          }).catch(error => {
            updateContents([{}]);
          });
        }
        break;
      case 'alarm':
        if (isAvailableView(rows)) {
          syncUpdate = false;
          let asyncAlarmKey = tabKey;

          //open detail without delaying
          detail.setState({
            loading: true
          });
          request.getAlarmList(rows[0].id).then(res => {
            let alarmItems = this.getAlarmItems(res);
            contents[asyncAlarmKey] = (
              <DetailMinitable
                __={__}
                title={__.alarm}
                defaultUnfold={true}
                tableConfig={alarmItems ? alarmItems : []} />
            );
            updateDetail(contents);
          }, () => {
            contents[asyncAlarmKey] = (<div />);
            updateDetail(contents);
          });
        }
        break;
      case 'action_log':
        if (isAvailableView(rows)) {
          syncUpdate = false;

          detail.setState({
            loading: true
          });

          request.getActionLog(rows[0].id).then(res => {
            let actionItems = this.getActionLogs(res.instanceActions);
            contents[tabKey] = (
              <DetailMinitable
                __={__}
                title={__.action_log}
                defaultUnfold={true}
                tableConfig={actionItems ? actionItems : []} />
            );
            updateDetail(contents);
          }, () => {
            contents[tabKey] = (<div />);
            updateDetail(contents);
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

  getAlarmItems(item) {
    let tableContent = [];
    item.forEach((element, index) => {
      if (element.type === 'gnocchi_resources_threshold' && element.gnocchi_resources_threshold_rule.resource_type === 'instance') {
        let dataObj = {
          id: index + 1,
          name: element.name,
          enabled: <span style={element.enabled ? {color: '#1eb9a5'} : {}}>{element.enabled ? __.enabled : __.closed}</span>,
          state: utils.getStateName(element.state),
          created_at: getTime(element.timestamp, true)
        };
        tableContent.push(dataObj);
      }
    });

    let tableConfig = {
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
    let flavor = '';
    if (item.flavor.name) {
      let ram = unitConverter(item.flavor.ram, 'MB');
      flavor = item.flavor.vcpus + 'CPU / ' + ram.num + ram.unit + ' / ' + item.flavor.disk + 'GB';
    } else {
      flavor = '(' + item.flavor.id.substr(0, 8) + ')';
    }

    let items = [{
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
          <span>
            {item.floating_ip.floating_ip_address}
          </span>
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
          <span>{item.keypair.name}</span>
        </span> : '-'
    }, {
      title: __.status,
      content: getStatusIcon(item.status)
    }, {
      title: __.create + __.time,
      type: 'time',
      content: item.created
    }, {
      title: __.owner,
      content: item.metadata ? item.metadata.owner : '-'
    }, {
      title: __.usage,
      content: item.metadata ? item.metadata.usage : '-'
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

  getRelatedSourcesItems(items) {
    let attchVolumes = [];
    items.volume.forEach((volume, i) => {
      let vid = '(' + volume.id.slice(0, 8) + ')',
        vname = volume.name || vid;
      attchVolumes.push({
        key: volume.name,
        data: <span>
            {vname + ' ( ' + volume.volume_type + ' | ' + volume.size + 'GB )'}
          </span>,
        childItem: volume
      });
    });

    let networks = [];
    for (let key in items.addresses) {
      let floatingIps = [], floatingIp = {};
      for (let item of items.addresses[key]) {
        if (item['OS-EXT-IPS:type'] === 'floating') {
          floatingIps.push({
            addr: item.addr,
            id: items.floating_ip.id,
            mac_addr: item['OS-EXT-IPS-MAC:mac_addr']
          });
        }
      }

      items.addresses[key].map((item, index) => {
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

          floatingIps.forEach(ip => {
            if (ip.mac_addr === item['OS-EXT-IPS-MAC:mac_addr']) {
              floatingIp = ip;
            }
          });

          networks.push({
            port: <a data-type="router" href={'/dashboard/port/' + item.port.id}>
                {item.addr}
              </a>,
            subnet: <a data-type="router" href={'/dashboard/subnet/' + item.subnet.id}>{item.subnet.name || '(' + item.subnet.id.substring(0, 8) + ')'}</a>,
            security_group: securityGroups,
            floating_ip: floatingIp && floatingIp.id ?
              <a data-type="router" href={'/dashboard/floating-ip/' + floatingIp.id}>{floatingIp.addr}</a> : '-',
            __renderKey: index,
            childItem: item
          });
          floatingIp = {};
        }
      });
    }

    let data = [{
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
    let data = [];
    items.forEach((item) => {
      let size = unitConverter(item.size);
      data.push({
        title: item.created_at,
        name: <span>{item.name}</span>,
        size: size.num + ' ' + size.unit,
        time: item.created_at,
        status: getStatusIcon(item.status),
        childItem: item
      });
    });

    return data;
  }

  refresh(data, forceUpdate) {
    if (data) {
      let path = router.getPathList();
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
    let _config = this.state.config;
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
    let that = this;
    switch (actionType) {
      case 'edit_name':
        let {
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
      case 'create_alarm':
        createAlarm({
          type: 'instance',
          item: data.rawItem
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
