require('./style/index.less');

const React = require('react');
const Main = require('client/components/main/index');

const BasicProps = require('client/components/basic_props/index');
const RelatedSnapshot = require('client/components/related_snapshot/index');
const LineChart = require('client/components/line_chart/index');
const {Button} = require('client/uskin/index');
const DetailMinitable = require('client/components/detail_minitable/index');

const deleteModal = require('client/components/modal_delete/index');
const createModal = require('./pop/create/index');
const attachInstance = require('./pop/attach_instance/index');
const createSnapshot = require('./pop/create_snapshot/index');
const detachInstance = require('./pop/detach_instance/index');
const setRead = require('./pop/set_read/index');
const setReadWrite = require('./pop/set_read_write/index');
const resizeVolume = require('./pop/resize/index');
const notify = require('../../utils/notify');
const createAlarm = require('../alarm/pop/create/index');
const createTransfer = require('./pop/create_transfer');
const deleteTransfer = require('./pop/delete_transfer');
const acceptTransfer = require('./pop/accept_transfer');
const updateBootable = require('./pop/update_bootable');
const alarmDetail = require('./pop/alarm_detail/index');
// const backupVolumn = require('./pop/backup_volumn/index');

const config = require('./config.json');
const __ = require('locale/client/dashboard.lang.json');
const request = require('./request');
const router = require('client/utils/router');
const msgEvent = require('client/applications/dashboard/cores/msg_event');
const getStatusIcon = require('../../utils/status_icon');
const getTime = require('client/utils/time_unification');
const utils = require('../../utils/utils');
const alarmUtils = require('../alarm/utils');

class Model extends React.Component {

  constructor(props) {
    super(props);

    let enableAlarm = HALO.settings.enable_alarm;
    if (enableAlarm) {
      let detail = config.table.detail.tabs;
      detail.push({
        name: ['console'],
        key: 'console'
      });
      detail.push({
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
    this.tableColRender(this.state.config.table.column);

    msgEvent.on('dataChange', (data) => {
      if (this.props.style.display !== 'none') {
        if (data.resource_type === 'volume' || data.resource_type === 'snapshot' || data.resource_type === 'instance') {
          this.refresh({
            detailRefresh: true
          }, false);

          if (data.action === 'delete'
            && data.stage === 'end'
            && data.resource_id === router.getPathList()[2]) {
            router.replaceState('/dashboard/volume');
          }
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

  tableColRender(columns) {
    columns.map((column) => {
      switch (column.key) {
        case 'size':
          column.render = (col, item, i) => {
            return item.size + ' GB';
          };
          break;
        case 'attch_instance':
          column.render = (col, item, i) => {
            let server = item.server;
            if (server && server.status === 'SOFT_DELETED') {
              return <span><i className="glyphicon icon-instance"></i>{'(' + server.id.substr(0, 8) + ')'}</span>;
            } else if (server) {
              return (
                <span>
                  <i className="glyphicon icon-instance" />
                  <a data-type="router" href={'/dashboard/instance/' + server.id}>
                    {server.name}
                  </a>
                </span>
              );
            }
          };
          break;
        case 'type':
          column.render = (col, item, i) => {
            return item.volume_type ?
              <span>
                <i className="glyphicon icon-performance" />
                {utils.getVolumeType(item.volume_type)}
              </span> : '';
          };
          break;
        case 'attributes':
          column.render = (col, item, i) => {
            if(item.metadata.readonly) {
              return item.metadata.readonly === 'True' ? __.read_only : __.read_write;
            } else {
              return __.read_write;
            }
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
        config: this.state.config
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

  onClickBtnList(key, refs, data) {
    let rows = data.rows;
    let that = this;
    switch (key) {
      case 'create':
        createModal();
        break;
      case 'update_bootable':
        updateBootable(rows[0]);
        break;
      /*case 'back_up':
        backupVolumn(rows[0]);
        break;*/
      case 'delete':
        deleteModal({
          __: __,
          action: 'delete',
          type: 'volume',
          data: rows,
          onDelete: function(_data, cb) {
            request.deleteVolumes(rows).then((res) => {
              cb(true);
            });
          }
        });
        break;
      case 'create_snapshot':
        createSnapshot(rows[0]);
        break;
      case 'attach_to_instance':
        attachInstance(rows[0]);
        break;
      case 'dtch_instance':
        detachInstance(rows[0]);
        break;
      case 'set_rd_only':
        setRead(rows[0], null, function() {
          notify({
            resource_name: rows[0].name,
            stage: 'end',
            action: 'update',
            resource_type: 'volume'
          });
          that.refresh(null, true);
        });
        break;
      case 'set_rd_wrt':
        setReadWrite(rows[0], null, function() {
          notify({
            resource_name: rows[0].name,
            stage: 'end',
            action: 'update',
            resource_type: 'volume'
          });
          that.refresh(null, true);
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
      case 'extd_capacity':
        resizeVolume(rows[0]);
        break;
      case 'create_transfer':
        createTransfer(rows[0], () => {
          this.forceRefresh();
        });
        break;
      case 'accept_transfer':
        acceptTransfer(rows[0], () => {
          this.forceRefresh();
        });
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

  onClickTableCheckbox(refs, data) {
    let {rows} = data,
      btnList = refs.btnList,
      btns = btnList.state.btns;

    btnList.setState({
      btns: this.btnListRender(rows, btns)
    });
  }

  btnListRender(rows, btns) {
    let len = rows.length;
    let isSingle = len === 1;
    let single, singleStatus;
    if (isSingle) {
      single = rows[0];
      singleStatus = single.status;
    }

    btns.update_bootable.disabled = !(isSingle && (singleStatus === 'available' || singleStatus === 'in-use'));
    // btns.back_up.disabled = !(isSingle && (singleStatus === 'available' || singleStatus === 'in-use'));
    btns.attach_to_instance.disabled = !(isSingle && singleStatus === 'available' && !single.attachments[0]);
    btns.create_transfer.disabled = !(isSingle && singleStatus === 'available');
    btns.create_snapshot.disabled = !(isSingle && (singleStatus === 'available' || singleStatus === 'in-use'));
    btns.dtch_instance.disabled = !(isSingle && singleStatus === 'in-use');
    btns.extd_capacity.disabled = !(isSingle && singleStatus === 'available');
    btns.set_rd_only.disabled = !(isSingle && singleStatus === 'available' && single.metadata.readonly !== 'True');
    btns.set_rd_wrt.disabled = !(isSingle && singleStatus === 'available' && single.metadata.readonly === 'True');

    let hasAttach = rows.some((item) => item.server);
    btns.delete.disabled = !(len > 0 && !hasAttach);

    return btns;
  }

  onClickDetailTabs(tabKey, refs, data) {
    let {rows} = data;
    let detail = refs.detail;
    let contents = detail.state.contents;
    let isAsync = false;

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

    switch(tabKey) {
      case 'description':
        if (isAvailableView(rows)) {
          let basicPropsItem = this.getBasicProps(rows[0]),
            relatedSnapshotItems = this.getRelatedSnapshotItems(rows[0].snapshots);
          contents[tabKey] = (
            <div>
              <BasicProps title={__.basic + __.properties}
                defaultUnfold={true}
                tabKey={'description'}
                items={basicPropsItem ? basicPropsItem : []}
                rawItem={rows[0]}
                onAction={this.onDetailAction.bind(this)}/>
              <RelatedSnapshot
                title={__.snapshot}
                defaultUnfold={true}
                tabKey={'description'}
                noItemAlert={__.no_related + __.snapshot}
                items={relatedSnapshotItems ? relatedSnapshotItems : []}
                rawItem={rows[0]}
                btnConfig={{
                  value: __.create + __.snapshot,
                  actionType: 'create_related_snapshot',
                  disabled: (rows[0].status === 'available' || rows[0].status === 'in-use') ? false : true
                }}
                onAction={this.onDetailAction.bind(this)}
                actionType={{
                  create: 'create_related_volume',
                  delete: 'delete_related_snapshot'
                }} />
            </div>
          );
        }
        break;
      case 'transfer_info':
        if (isAvailableView(rows)) {
          detail.loading();
          isAsync = true;

          let volume = rows[0];
          let volumeId = volume.id;

          request.getTransferList().then((res) => {
            const transfer = res.transfers.find((ele) => ele.volume_id === volumeId);

            if (transfer) {
              let transferInfos = this.getTransferInfo(transfer);

              contents[tabKey] = (
                <div>
                  <BasicProps title={__.transfer_info}
                    defaultUnfold={true}
                    tabKey={'transfer_info'}
                    items={transferInfos}
                    rawItem={volume} />
                  <div style={{ marginLeft: '20px' }}>
                    <Button value={__.cancel_transfer} onClick={this.onDetailAction.bind(this, 'transfer_info', 'delete_transfer', {
                      transfer: transfer,
                      volume: volume
                    })} />
                  </div>
                </div>
              );
            } else {
              contents[tabKey] = (
                <div className="no-data-desc">
                  <p>{__.no_transfer_tip}</p>
                </div>
              );
            }

            detail.setState({
              contents: contents,
              loading: false
            });

          });

        }
        break;
      case 'console':
        if (isAvailableView(rows)) {
          let that = this;

          let updateDetailMonitor = function(newContents, loading) {
            detail.setState({
              contents: newContents,
              loading: loading
            });
          };

          let time = data.time;

          //open detail without delaying
          contents[tabKey] = (<div/>);
          updateDetailMonitor(contents, true);

          let metricType = ['disk.device.read.bytes.rate', 'disk.device.write.bytes.rate', 'disk.device.read.requests.rate', 'disk.device.write.requests.rate'];
          let telemerty = HALO.configs.telemerty,
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

          let updateContents = (arr, xAxisData) => {
            let chartDetail = {
              key: key,
              item: rows[0],
              data: arr,
              granularity: granularity,
              time: time
            };
            contents[tabKey] = (
              <LineChart
                __={__}
                item={rows[0]}
                data={arr}
                granularity={granularity}
                tabItems={tabItems}
                className={'volume'}
                start={utils.getTime(time)}
                clickTabs={(e, tab, item) => {
                  that.onClickDetailTabs('console', refs, {
                    rows: rows,
                    granularity: tab.value,
                    key: tab.key,
                    time: tab.time
                  });
                }}
                clickParent={(page) => {
                  that.onDetailAction('description', 'chart_zoom', {
                    chartDetail: chartDetail,
                    page: page
                  });
                }}>
                <Button value={__.create + __.alarm} onClick={this.onDetailAction.bind(this, 'description', 'create_alarm', { rawItem: rows[0] })}/>
              </LineChart>
            );

            updateDetailMonitor(contents);
          };
          if (data.granularity) {
            updateContents([]);
          }
          //rows[0].attachments[0].server_id
          if (rows[0].attachments[0]) {
            let device = rows[0].attachments[0].device.split('/'), ids = [],
              resourceId = rows[0].attachments[0].server_id + '-' + device[device.length - 1];
            request.getNetworkResourceId(resourceId, granularity).then(res => {
              metricType.forEach(type => {
                res[0] && ids.push(res[0].metrics[type]);
              });
              if (res.length !== 0) {
                request.getMeasures(ids, granularity, utils.getTime(time)).then((_r) => {
                  let arr = _r.map((r, index) => ({
                    title: alarmUtils.getMetricName(metricType[index]),
                    color: alarmUtils.getColor(metricType[index]),
                    unit: alarmUtils.getUnit('volume', metricType[index], r),
                    yAxisData: alarmUtils.getChartData(r, granularity, utils.getTime(time), metricType[index], 'volume'),
                    xAxis: alarmUtils.getChartData(r, granularity, utils.getTime(time), metricType[index])
                  }));
                  updateContents(arr);
                });
              } else {
                contents[tabKey] = (
                  <div className="no-data-desc">
                    <p>{__.view_is_unavailable}</p>
                  </div>
                );
                updateDetailMonitor(contents, false);
              }
            }).catch(error => {
              updateContents([{}]);
            });
          } else {
            contents[tabKey] = (
              <div className="no-data-desc">
                <p>{__.volume + (rows[0].name ? rows[0].name : '(' + rows[0].id.substr(0, 8) + ')') + __.no_data + __.comma + __.view_is_unavailable}</p>
              </div>
            );
            updateDetailMonitor(contents, false);
          }
        }
        break;
      case 'alarm':
        if (isAvailableView(rows)) {
          let asyncAlarmKey = tabKey;

          let updateDetailAlarm = function(newContents) {
            detail.setState({
              contents: newContents,
              loading: false
            });
          };

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
            updateDetailAlarm(contents);
          }, () => {
            contents[asyncAlarmKey] = (<div />);
            updateDetailAlarm(contents);
          });
        }
        break;
      default:
        break;
    }

    if (!isAsync) {
      detail.setState({
        contents: contents
      });
    }
  }

  getAlarmItems(item) {
    let tableContent = [];
    item.forEach((element, index) => {
      if (element.type === 'gnocchi_resources_threshold' && element.gnocchi_resources_threshold_rule.resource_type === 'volume') {
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

  getTransferInfo(transfer) {
    let data = [{
      title: __.transfer_id,
      content: transfer.id
    }, {
      title: __.transfer_name,
      content: transfer.name
    }];

    return data;
  }

  getBasicProps(item) {
    let getAttachments = (_item) => {
      let server = _item.server;
      if (server && server.status === 'SOFT_DELETED') {
        return <span><i className="glyphicon icon-instance"></i>{'(' + server.id.substr(0, 8) + ')'}</span>;
      } else if (server) {
        return (
          <span>
            <i className="glyphicon icon-instance" />
            <a data-type="router" href={'/dashboard/instance/' + server.id}>
              {server.name}
            </a>
          </span>
        );
      }
    };

    let data = [{
      title: __.name,
      type: 'editable',
      content: item.name
    }, {
      title: __.id,
      content: item.id
    }, {
      title: __.size,
      content: item.size + ' GB'
    }, {
      title: __.type,
      content: utils.getVolumeType(item.volume_type)
    }, {
      title: __.attach_to + __.instance,
      content: item.attachments.length > 0 ? getAttachments(item) : '-'
    }, {
      title: __.attributes,
      content: (() => {
        if(item.metadata.readonly) {
          return item.metadata.readonly === 'False' ? __.read_write : __.read_only;
        } else {
          return __.read_write;
        }
      })()
    }, {
      title: __.bootable,
      content: item.bootable === 'true' ? __.yes : __.no
    }, {
      title: __.status,
      content: getStatusIcon(item.status)
    }, {
      title: __.create + __.time,
      type: 'time',
      content: item.created_at
    }];

    if (HALO.settings.enable_approval) {
      let metadata = item.metadata;
      data.push({
        title: __.owner,
        content: metadata.owner ? metadata.owner : '-'
      }, {
        title: __.usage,
        content: metadata.usage ? metadata.usage : '-'
      });
    }

    return data;
  }

  getRelatedSnapshotItems(items) {
    let data = [];
    items.forEach((item) => {
      data.push({
        title: item.created_at,
        name:
          <span>
            <i className="glyphicon icon-snapshot" />
            <a data-type="router" href={'/dashboard/snapshot/' + item.id}>{item.name}</a>
          </span>,
        size: item.size + 'GB',
        time: item.created_at,
        status: getStatusIcon(item.status),
        createIcon: 'volume',
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
    switch(tabKey) {
      case 'description':
        this.onDescriptionAction(actionType, data);
        break;
      case 'transfer_info':
        this.onTrasferAction(actionType, data);
        break;
      default:
        break;
    }
  }

  onDescriptionAction(actionType, data) {
    switch(actionType) {
      case 'edit_name':
        let {rawItem, newName} = data;
        request.editVolumeName(rawItem, newName).then((res) => {
          this.refresh({
            detailRefresh: true
          }, true);
        });
        break;
      case 'create_related_volume':
        createModal(data.childItem);
        break;
      case 'create_related_snapshot':
        createSnapshot(data.rawItem);
        break;
      case 'delete_related_snapshot':
        deleteModal({
          __: __,
          action: 'delete',
          type: 'snapshot',
          data: [data.childItem],
          onDelete: function(_data, cb) {
            request.deleteSnapshot(data.childItem);
            cb(true);
          }
        });
        break;
      case 'create_alarm':
        createAlarm({
          type: 'volume',
          item: data.rawItem
        });
        break;
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

  onTrasferAction(actionType, data) {
    switch(actionType) {
      case 'delete_transfer':
        deleteTransfer(data, () => {
          this.forceRefresh();
        });
        break;
      default:
        break;
    }
  }

  forceRefresh() {
    this.refresh({
      tableLoading: true,
      detailLoading: true,
      detailRefresh: true
    }, true);
  }

  render() {
    return (
      <div className="halo-module-volume" style={this.props.style}>
        <Main
          ref="dashboard"
          visible={this.props.style.display === 'none' ? false : true}
          onInitialize={this.onInitialize}
          onAction={this.onAction}
          onClickDetailTabs={this.onClickDetailTabs.bind(this)}
          config={this.state.config}
          params={this.props.params}
          getStatusIcon={getStatusIcon}
          __={__} />
      </div>
    );
  }

}

module.exports = Model;
