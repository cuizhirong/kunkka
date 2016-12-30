var React = require('react');
var utils = require('../utils');
var helper = require('../pop/create/helper');
var __ = require('locale/client/dashboard.lang.json');
var getStatusIcon = require('../../../utils/status_icon');
var request = require('../request');
var deleteModal = require('client/components/modal_delete/index');

module.exports = {

  getAlarmPolicyDesc: function(item) {
    let rule = item.gnocchi_resources_threshold_rule;

    if (rule) {
      let metric = rule ? rule.metric : null;
      let type = utils.getMetricName(metric);
      let comparison = utils.getComparisionName(rule.comparison_operator);

      let policy = __.alarm_policy_desc.replace('{type}', type)
      .replace('{comparison}', comparison)
      .replace('{threshold}', rule.threshold)
      .replace('{unit}', helper.getMetricUnit(rule.resource_type, rule.metric))
      .replace('{period}', rule.evaluation_periods)
      .replace('{granularity}', rule.granularity);

      return policy;
    }

    return null;
  },

  getBasicPropsItems: function(item) {
    let rule = item.gnocchi_resources_threshold_rule;
    let metric = rule ? rule.metric : null;
    let metricName = utils.getMetricName(metric);

    let resourceName = utils.getResourceComponent(item);
    let policyDesc = this.getAlarmPolicyDesc(item);

    let items = [{
      title: __.name,
      content: item.name || '(' + item.id.substring(0, 8) + ')',
      type: 'editable'
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
      content: getStatusIcon(item.status)
    }, {
      title: __.create + __.time,
      content: item.state_timestamp,
      type: 'time'
    }];

    return items;
  },

  getNotificationId: function(url) {
    return url.split('/v1/topics/')[1].split('/alarm')[0];
  },

  removeNotification: function({item: alarm, alarmType, id: notficationId, cb: callback, name: notficationName}) {
    let that = this;
    deleteModal({
      __: __,
      action: 'delete',
      type: 'notification_list',
      data: [{
        id: notficationId,
        name: notficationName
      }],
      iconType: 'notification',
      onDelete: function(_data, cb) {
        let index = -1;
        let actions = alarm[alarmType + '_actions'];
        actions.some((url, i) => that.getNotificationId(url) === notficationId ? (index = i, true) : false);
        if (index > -1) {
          actions.splice(index, 1);
        }

        request.updateAlarm(alarm.alarm_id, alarm).then((res) => {
          cb && cb(true);
          callback && callback();
        });
      }
    });
  },

  getNotificationConfig: function(item, notifications, cb) {

    function findNotificationName(id) {
      let n = notifications.find((ele) => ele.id === id);
      return n ? n.name : id.slice(0, 8);
    }

    let that = this;
    let countId = 0;
    function getRow(alarmType, trigger, id) {
      let name = findNotificationName(id);
      return {
        id: countId++,
        type: alarmType,
        trigger: trigger,
        trigger_behavior: __.alarm_send,
        notification_list: name,
        operation: <i className="glyphicon icon-delete" onClick={that.removeNotification.bind(that, {item, alarmType, id, cb, name})} />
      };
    }

    let alarms = item.alarm_actions.map((url, i) =>
      getRow('alarm', __.alarm_when_alarm, this.getNotificationId(url))
    );
    let insufDatas = item.insufficient_data_actions.map((url, i) =>
      getRow('insufficient_data', __.alarm_when_data_insufficient, this.getNotificationId(url))
    );
    let oks = item.ok_actions.map((url, i) =>
      getRow('ok', __.alarm_when_ok, this.getNotificationId(url))
    );

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
        title: __.operation,
        key: 'operation',
        dataIndex: 'operation'
      }],
      dataKey: 'id',
      hover: true,
      data: alarms.concat(insufDatas, oks)
    };

    return table;

  }

};
