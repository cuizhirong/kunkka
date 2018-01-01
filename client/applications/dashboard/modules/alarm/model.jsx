require('./style/index.less');

const React = require('react');
const Main = require('client/components/main/model');
const { Button } = require('client/uskin/index');

const BasicProps = require('client/components/basic_props/index');
const DetailMiniTable = require('client/components/detail_minitable/index');
const LineChart = require('client/components/line_chart/index');
const description = require('./detail/description');
const history = require('./detail/history');

const createAlarm = require('./pop/create/index');
const enableAlarm = require('./pop/enable_alarm/index');
const deleteModal = require('client/components/modal_delete/index');
const addNotification = require('./pop/add_notification/index');
const alarmDetail = require('./pop/alarm_detail/index');

const config = require('./config.json');
const __ = require('locale/client/dashboard.lang.json');
const request = require('./request');
const getStatusIcon = require('../../utils/status_icon');
const getErrorMessage = require('client/applications/dashboard/utils/error_message');
const utils = require('./utils');
const timeUtils = require('../../utils/utils');

class Model extends Main {

  constructor(props) {
    super(props);

    this.state = {
      config: config
    };

    this.lang = __;
    this.getStatusIcon = getStatusIcon;
  }

  tableColRender() {
    let columns = this.state.config.table.column;

    columns.forEach((column) => {
      switch (column.key) {
        case 'resource':
          column.render = (col, item, i) => {
            return utils.getResourceComponent(item);
          };
          break;
        case 'enabled':
          column.render = (col, item, i) => {
            return item.enabled ?
              <span className="label-active">{__.on}</span>
            : <span className="label-down">{__.off}</span>;
          };
          break;
        default:
          break;
      }
    });

  }

  getList(forceUpdate, detailRefresh) {
    return request.getList(forceUpdate);
  }

  onClickBtnList(key, refs, data) {
    let rows = data.rows;
    switch (key) {
      case 'create':
        createAlarm({
          type: 'create'
        }, null, () => {
          this.refreshForce();
        });
        break;
      case 'enable':
        enableAlarm(rows[0], true, () => {
          this.refreshForce();
        });
        break;
      case 'disable':
        enableAlarm(rows[0], false, () => {
          this.refreshForce();
        });
        break;
      case 'modify':
        createAlarm({
          type: 'alarm',
          item: rows[0]
        }, null, () => {
          this.refreshForce();
        });
        break;
      case 'delete':
        let that = this;
        deleteModal({
          __: __,
          action: 'delete',
          type: 'alarm',
          data: rows,
          iconType: 'monitor',
          onDelete: function(_data, cb) {
            let alarmId = rows[0].alarm_id;
            request.deleteAlarm(alarmId).then((res) => {
              cb(true);
              that.refreshForce();
            }).catch((error) => {
              cb(false, getErrorMessage(error));
            });
          }
        });
        break;
      default:
        break;
    }
  }

  btnListRender(rows, btns) {
    let isSingle = rows.length === 1;

    btns.enable.disabled = !(isSingle && !rows[0].enabled);
    btns.disable.disabled = !(isSingle && rows[0].enabled);
    btns.modify.disabled = !isSingle;
    btns.delete.disabled = !isSingle;

    return btns;
  }

  onClickDetailTabs(tabKey, refs, data) {
    let {rows} = data;
    let detail = refs.detail;
    let contents = detail.state.contents;

    let syncUpdate = true;
    let isSingle = rows.length === 1;
    let unavailableView = (
      <div className="no-data-desc">
        <p>{__.view_is_unavailable}</p>
      </div>
    );
    if (!isSingle) {
      contents[tabKey] = unavailableView;
    }
    let update = (newContents, loading) => {
      detail.setState({
        contents: newContents,
        loading: loading
      });
    };
    const detailLoading = () => {
      contents[tabKey] = (<div />);
      detail.setState({
        contents: contents,
        loading: true
      });
    };

    switch(tabKey) {
      case 'description':
        if (isSingle) {
          syncUpdate = false;

          request.getNofitications().then((notifications) => {

            let item = rows[0];
            let rule = item.gnocchi_resources_threshold_rule;
            const updateContent = (resourceItem) => {
              let basicPropsItem = description.getBasicPropsItems(resourceItem);
              let notificationConfig = description.getNotificationConfig(resourceItem, notifications, this.refreshForce);

              contents[tabKey] = (
                <div>
                  <BasicProps
                    title={__.basic + __.properties}
                    defaultUnfold={true}
                    tabKey={'description'}
                    items={basicPropsItem ? basicPropsItem : []}
                    rawItem={resourceItem}
                    onAction={this.onDetailAction.bind(this)} />
                  <DetailMiniTable
                    __={__}
                    title={__.alarm_notification}
                    defaultUnfold={true}
                    tableConfig={notificationConfig}
                  >
                    <Button value={__.add + __.alarm_notification}
                      onClick={this.onDetailAction.bind(this, 'description', 'add_alarm_notification', {
                        rawItem: resourceItem
                      })} />
                  </DetailMiniTable>
                </div>
              );

              update(contents);
            };
            if (rule.resource_type === 'instance_network_interface') {
              if (!rule._port_id) {
                detailLoading();

                request.getOriginalPort(rule.resource_id).then((args) => {
                  const ports = args[0];
                  const resource = args[1];
                  let originalPortId = resource.original_resource_id.slice(-11);

                  ports.some((port) => {
                    let portId = port.id.substr(0, 11);

                    if (originalPortId === portId) {
                      rule._port_id = port.id;
                      rule._port_name = port.name;
                      rule._port_exist = true;
                      return true;
                    }
                    return false;
                  });

                  if (!rule._port_exist) {
                    rule._port_id = originalPortId;
                  }

                  updateContent(item);
                });
              } else {
                updateContent(item);
              }
            } else if (rule.resource_type === 'instance_disk') {
              if (!rule._volume_id) {
                detailLoading();

                request.getOriginalVolume(rule.resource_id).then((args) => {
                  const instances = args[0].instance;
                  const resource = args[1];

                  let instanceId = resource.original_resource_id.slice(0, -4);
                  let volumeMark = resource.original_resource_id.slice(-4).split('-')[1]; //vda, vdb ...
                  let instance = instances.find((ins) => ins.id === instanceId);

                  if (instance) {
                    instance.volume.some((vol) => {
                      let attch = vol.attachments[0];
                      if (attch) {
                        if (attch.device.split('/')[2] === volumeMark) {
                          rule._volume_id = vol.id;
                          rule._volume_name = vol.name;
                          rule._volume_exist = true;

                          return true;
                        }
                        return false;
                      }
                      return false;
                    });
                  }
                  updateContent(item);
                });
              } else {
                updateContent(item);
              }
            } else { //rule.resource_type === 'instance'
              updateContent(item);
            }

          });
        }
        break;
      case 'monitor':
        if (isSingle) {
          syncUpdate = false;
          let that = this;

          let telemerty = HALO.configs.telemerty,
            hour = telemerty.hour,
            day = telemerty.day,
            week = telemerty.week,
            month = telemerty.month,
            year = telemerty.year;

          let granularity = '', key = '';
          if (data.granularity) {
            granularity = data.granularity;
            key = data.key;
          } else {
            granularity = hour;
            key = hour;
            detailLoading();
          }
          let time = data.time;

          let rule = rows[0].gnocchi_resources_threshold_rule;

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

          tabItems.some((ele) => ele.key === key ? (ele.default = true, true) : false);

          let updateContents = (arr) => {
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
                className={'alarm'}
                start={timeUtils.getTime(time)}
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
                    page: page
                  });
                }} />
            );

            update(contents);
          };

          if (data.granularity) {
            updateContents([]);
          }

          let graphs;
          request.getResourceMeasures(rule.resource_id, rule.metric, granularity, timeUtils.getTime(time)).then((measures) => {
            if (rule._port_id && rule._port_exist) {
              request.getPortById(rule._port_id).then(port => {
                graphs = [measures].map((arr) => ({
                  title: utils.getMetricName(rule.metric, port.port.fixed_ips[0].ip_address),
                  color: utils.getColor(rule.metric),
                  unit: utils.getUnit(rule.resource_type, rule.metric, arr),
                  yAxisData: utils.getChartData(arr, key, timeUtils.getTime(time), rule.metric, rule.resource_type),
                  xAxis: utils.getChartData(arr, key, timeUtils.getTime(time), rule.metric)
                }));
                updateContents(graphs);
              });
            } else {
              graphs = [measures].map((arr) => ({
                title: utils.getMetricName(rule.metric),
                color: utils.getColor(rule.metric),
                unit: utils.getUnit(rule.resource_type, rule.metric, arr),
                yAxisData: utils.getChartData(arr, key, timeUtils.getTime(time), rule.metric, rule.resource_type),
                xAxis: utils.getChartData(arr, key, timeUtils.getTime(time), rule.metric)
              }));
              updateContents(graphs);
            }
          }).catch((err) => {
            updateContents([{}]);
          });
        }
        break;
      case 'history':
        if (isSingle) {
          syncUpdate = false;
          update(contents, true);

          request.getAlarmHistory(rows[0].alarm_id).then((res) => {

            let tableItems = history.getHistoryConfig(res);

            contents[tabKey] = (
              <div>
                <DetailMiniTable
                  __={__}
                  title={__.history}
                  defaultUnfold={true}
                  tableConfig={tableItems} />
              </div>
            );

            update(contents);
          });
        }
        break;
      default:
        break;
    }

    if (syncUpdate) {
      update(contents);
    }
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
        let { rawItem, newName } = data;
        let newItem = Object.assign({}, rawItem);
        newItem.name = newName;

        request.updateAlarm(newItem.alarm_id, newItem).then((res) => {
          this.refreshForce();
        });
        break;
      case 'add_alarm_notification':
        addNotification(data.rawItem, this.refreshForce);
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

}

module.exports = Model;
