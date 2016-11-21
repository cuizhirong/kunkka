require('./style/index.less');

var React = require('react');
var Main = require('client/components/main/model');
var {Button} = require('client/uskin/index');

var BasicProps = require('client/components/basic_props/index');
var DetailMiniTable = require('client/components/detail_minitable/index');

// var createAlarm = require('./pop/create/index');
// var addNotification = require('./pop/add_notification/index');
// var deleteModal = require('client/components/modal_delete/index');

var config = require('./config.json');
var __ = require('locale/client/dashboard.lang.json');
var request = require('./request');
var getStatusIcon = require('../../utils/status_icon');
var moment = require('client/libs/moment');

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
            return this.getResourceName(item);
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

  getResourceName(item) {
    if (item.gnocchi_resources_threshold_rule) {
      let rule = item.gnocchi_resources_threshold_rule;

      return (
        <span className={rule.resource_name ? 'label-active' : ''}>
          <i className="glyphicon icon-instance" />
          {rule.resource_name ? rule.resource_name : '(' + rule.resource_id.substr(0, 8) + ')'}
        </span>
      );
    }
    return null;
  }

  getMetricName(item) {
    let rule = item.gnocchi_resources_threshold_rule;
    let type = rule ? rule.resource_type : null;

    if (type) {
      switch (type) {
        case 'disk.read.bytes.rate':
          return __.disk_read_rate;
        case 'disk.write.bytes.rate':
          return __.disk_write_rate;
        case 'cpu_util':
          return __.cpu_utilization;
        default:
          return type;
      }
    }
    return null;
  }

  getComparisionName(comparision) {
    switch(comparision) {
      case 'gt':
        return __.greater_than;
      case 'lt':
        return __.less_than;
      case 'eq':
        return __.equal_as;
      default:
        return '(' + comparision + ')';
    }
  }

  getAlarmPolicyDesc(item) {
    let rule = item.gnocchi_resources_threshold_rule;

    if (rule) {
      let type = this.getMetricName(item);
      let comparison = this.getComparisionName(rule.comparison_operator);

      return __.alarm_policy_desc.replace('{type}', type)
      .replace('{comparison}', comparison)
      .replace('{threshold}', rule.threshold)
      .replace('{period}', rule.evaluation_periods)
      .replace('{granularity}', rule.granularity);
    }

    return null;
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

  onClickBtnList(key, refs, data) {
    // var rows = data.rows;
    switch (key) {
      case 'create':
        // createAlarm(null, null, () => {});
        break;
      case 'enable':
        // request.updateAlarm(rows[0].alarm_id);
        break;
      case 'disable':
        // request.updateAlarm(rows[0].alarm_id);
        break;
      case 'modify':
        break;
      case 'delete':
        // deleteModal({
        //   __: __,
        //   action: 'delete',
        //   type: 'prv_network',
        //   data: rows,
        //   iconType: 'network',
        //   onDelete: function(_data, cb) {
        //     request.deleteNetworks(rows).then((res) => {
        //       cb(true);
        //     }).catch((error) => {
        //       cb(false, getErrorMessage(error));
        //     });
        //   }
        // });
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
    var {rows} = data;
    var detail = refs.detail;
    var contents = detail.state.contents;

    var syncUpdate = true;
    var isSingle = rows.length === 1;
    var unavailableView = (
      <div className="no-data-desc">
        <p>{__.view_is_unavailable}</p>
      </div>
    );
    if (!isSingle) {
      contents[tabKey] = unavailableView;
    }
    var update = (newContents, loading) => {
      detail.setState({
        contents: newContents,
        loading: loading
      });
    };

    switch(tabKey) {
      case 'description':
        if (isSingle) {
          let basicPropsItem = this.getBasicPropsItems(rows[0]);
          let notificationConfig = this.getNotificationConfig(rows[0]);

          contents[tabKey] = (
            <div>
              <BasicProps
                title={__.basic + __.properties}
                defaultUnfold={true}
                tabKey={'description'}
                items={basicPropsItem ? basicPropsItem : []}
                rawItem={rows[0]}
                onAction={this.onDetailAction.bind(this)} />
              <DetailMiniTable
                __={__}
                title={__.alarm_notification}
                defaultUnfold={true}
                tableConfig={notificationConfig}
              >
                <Button value={__.add + __.alarm_notification}
                  onClick={this.onDetailAction.bind(this, 'description', 'add_alarm_notification', {
                    rawItem: rows[0]
                  })} />
              </DetailMiniTable>
            </div>
          );
        }
        break;
      case 'history':
        if (isSingle) {
          syncUpdate = false;
          update(contents, true);

          request.getAlarmHistory(rows[0].alarm_id).then((history) => {

            let tableItems = this.getHistoryConfig(history);

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

  getBasicPropsItems(item) {
    let metricName = this.getMetricName(item);
    let resourceName = this.getResourceName(item);
    let policyDesc = this.getAlarmPolicyDesc(item);

    let items = [{
      title: __.name,
      content: item.name || '(' + item.id.substring(0, 8) + ')'
    }, {
      title: __.id,
      content: item.alarm_id
    }, {
      title: __.enabled_state,
      content: item.enabled ? __.on : __.off
    }, {
      title: __.metrics,
      content: metricName ? metricName : '-'
    }, {
      title: __.resource,
      content: resourceName ? resourceName : '-'
    }, {
      title: __.description,
      content: item.description
    }, {
      title: __.alarm_policy,
      content: policyDesc ? policyDesc : '-'
    }, {
      title: __.status,
      content: getStatusIcon(item.state)
    }, {
      title: __.create + __.time,
      content: item.state_timestamp,
      type: 'time'
    }];

    return items;
  }

  getNotificationConfig(item) {
    var datas = item.alarm_actions.map((ele, i) => {
      return {};
    });

    var table = {
      column: [{
        title: __.trigger,
        key: 'trigger',
        dataIndex: 'trigger'
      }, {
        title: __.trigger_behavior,
        key: 'trigger_behavior',
        dataIndex: 'trigger_behavior'
      }, {
        title: __.notification_list,
        key: 'notification_list',
        dataIndex: 'notification_list'
      }, {
        title: __.action,
        key: 'action',
        dataIndex: 'action'
      }],
      dataKey: 'id',
      hover: true,
      data: datas
    };

    return table;
  }

  getState(state) {
    switch (state) {
      case 'alarm':
        return __.alarm;
      case 'insufficient data':
        return __.data_insufficient;
      case 'ok':
        return __.alarm_ok;
      default:
        return state;
    }
  }

  getHistoryConfig(data) {
    var datas = data.map((ele, i) => {
      let type = '';
      let action = '';
      let detail = JSON.parse(ele.detail);

      switch (ele.type) {
        case 'creation':
          type = __.creation;
          action = detail.name ? __.successfully_created_alarm.replace('{0}', detail.name) : '';
          break;
        case 'rule change':
          type = __.rule_change;
          if (typeof detail.enabled === 'boolean') {
            action = detail.enabled ? __.enable + __.alarm : __.disable + __.alarm;
          } else {
            action = Object.keys(detail).map((key) => key + ' : ' + detail[key]).join(', ');
          }
          break;
        case 'state transition':
          type = __.state_transition;
          action = detail.state ? __.transition_to + this.getState(detail.state) : '';
          break;
        case 'deletion':
          type = __.deletion;
          break;
        default:
          type = ele.type;
          break;
      }

      return {
        timestamp: moment(ele.timestamp).format('YYYY-MM-DD hh:mm:ss'),
        type: type,
        action: action,
        id: i
      };
    });

    var table = {
      column: [{
        title: __.timestamp,
        key: 'timestamp',
        dataIndex: 'timestamp',
        width: 140
      }, {
        title: __.action_type,
        key: 'action_type',
        dataIndex: 'type',
        width: 100
      }, {
        title: __.action_detail,
        key: 'action_detail',
        dataIndex: 'action'
      }],
      dataKey: 'id',
      hover: true,
      data: datas
    };

    return table;
  }

  onDescriptionAction(actionType, data) {
    switch(actionType) {
      case 'add_alarm_notification':
        // addNotification(data.rawItem);
        break;
      default:
        break;
    }
  }

}

module.exports = Model;
