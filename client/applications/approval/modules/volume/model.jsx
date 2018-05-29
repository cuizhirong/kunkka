require('./style/index.less');

const React = require('react');
const Main = require('client/components/main/index');

const BasicProps = require('client/components/basic_props/index');
const RelatedSnapshot = require('client/components/related_snapshot/index');
const DetailMinitable = require('client/components/detail_minitable/index');
const LineChart = require('client/components/line_chart/index');
const {Button} = require('client/uskin/index');

const deleteModal = require('client/components/modal_delete/index');
const createModal = require('./pop/create/index');
const attachInstance = require('./pop/attach_instance/index');
const createSnapshot = require('./pop/create_snapshot/index');
const detachInstance = require('./pop/detach_instance/index');
const setRead = require('./pop/set_read/index');
const setReadWrite = require('./pop/set_read_write/index');
const resizeVolume = require('./pop/resize/index');
const changeOwner = require('./pop/change_owner/index');
const changeUsage = require('./pop/change_usage/index');
const notify = require('../../utils/notify');
const createAlarm = require('../alarm/pop/create/index');

const config = require('./config.json');

const request = require('./request');
const router = require('client/utils/router');
const msgEvent = require('client/applications/approval/cores/msg_event');
const getStatusIcon = require('../../utils/status_icon');
const getTime = require('client/utils/time_unification');
const utils = require('../alarm/utils');
const timeUtils = require('../../utils/utils');

class Model extends React.Component {

  constructor(props) {
    super(props);

    let enableAlarm = HALO.settings.enable_alarm;
    if (!enableAlarm) {
      let detail = config.table.detail.tabs;
      delete detail[1];
      delete detail[2];
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
            router.replaceState('/approval/volume');
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
                  <a data-type="router" href={'/approval/instance/' + server.id}>
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
                {timeUtils.getVolumeType(item)}
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

      let detail = this.refs.approval.refs.detail;
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

  closeDetail() {
    let detail = this.refs.approval.refs.detail;
    detail.onClose();
  }

  onClickBtnList(key, refs, data) {
    let rows = data.rows;
    let that = this;
    switch (key) {
      case 'create':
        createModal();
        break;
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

    for(let key in btns) {
      switch (key) {
        case 'create_snapshot':
          btns[key].disabled = (len === 1 && (rows[0].status === 'available' || rows[0].status === 'in-use')) ? false : true;
          break;
        case 'dtch_instance':
          btns[key].disabled = (len === 1 && rows[0].status === 'in-use') ? false : true;
          break;
        case 'attach_to_instance':
          btns[key].disabled = (len === 1 && rows[0].status === 'available') ? false : true;
          break;
        case 'extd_capacity':
          btns[key].disabled = (len === 1 && rows[0].status === 'available') ? false : true;
          break;
        case 'set_rd_only':
          btns[key].disabled = (len === 1 && rows[0].status === 'available' && rows[0].metadata.readonly !== 'True') ? false : true;
          break;
        case 'set_rd_wrt':
          btns[key].disabled = (len === 1 && rows[0].status === 'available' && rows[0].metadata.readonly === 'True') ? false : true;
          break;
        case 'chg_owner':
          btns[key].disabled = (len === 1) ? false : true;
          break;
        case 'chg_usage':
          btns[key].disabled = (len === 1) ? false : true;
          break;
        case 'delete':
          let hasAttach = rows.some((item) => {
            return item.server ? true : false;
          });
          btns[key].disabled = (len > 0) && !hasAttach ? false : true;
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
                  value: __.apply_ + __.snapshot,
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

          let updateContents = (arr, xAxisData) => {
            contents[tabKey] = (
              <LineChart
                __={__}
                item={rows[0]}
                data={arr}
                granularity={granularity}
                tabItems={tabItems}
                start={timeUtils.getTime(time)}
                clickTabs={(e, tab, item) => {
                  that.onClickDetailTabs('console', refs, {
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
          //rows[0].attachments[0].server_id
          if (rows[0].attachments[0]) {
            let device = rows[0].attachments[0].device.split('/'), ids = [],
              resourceId = rows[0].attachments[0].server_id + '-' + device[device.length - 1];
            request.getNetworkResourceId(resourceId, granularity).then(res => {
              metricType.forEach(type => {
                res[0] && ids.push(res[0].metrics[type]);
              });
              if (res.length !== 0) {
                request.getMeasures(ids, granularity, timeUtils.getTime(time)).then((_r) => {
                  let arr = _r.map((r, index) => ({
                    title: utils.getMetricName(metricType[index]),
                    unit: utils.getUnit('volume', metricType[index]),
                    yAxisData: utils.getChartData(r, granularity, timeUtils.getTime(time), 'volume'),
                    xAxis: utils.getChartData(r, granularity, timeUtils.getTime(time))
                  }));
                  updateContents(arr);
                });
              } else {
                updateContents([{}]);
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

    detail.setState({
      contents: contents
    });
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

  getBasicProps(item) {
    let getAttachments = (_item) => {
      let server = _item.server;
      if (server && server.status === 'SOFT_DELETED') {
        return <span><i className="glyphicon icon-instance"></i>{'(' + server.id.substr(0, 8) + ')'}</span>;
      } else if (server) {
        return (
          <span>
            <i className="glyphicon icon-instance" />
            <a data-type="router" href={'/approval/instance/' + server.id}>
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
      content: timeUtils.getVolumeType(item)
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
      title: __.status,
      content: getStatusIcon(item.status)
    }, {
      title: __.create + __.time,
      type: 'time',
      content: item.created_at
    }, {
      title: __.owner,
      content: item.metadata.owner ? item.metadata.owner : '-'
    }, {
      title: __.usage,
      content: item.metadata.usage ? item.metadata.usage : '-'
    }];

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
            <a data-type="router" href={'/approval/snapshot/' + item.id}>{item.name}</a>
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
          this.refs.approval.refs.detail.loading();
        }
      } else {
        if (data.tableLoading) {
          this.loadingTable();
        }
        if (data.clearState) {
          this.refs.approval.clearState();
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
      default:
        break;
    }
  }

  render() {
    return (
      <div className="halo-module-volume" style={this.props.style}>
        <Main
          ref="approval"
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
