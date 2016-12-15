var utils = require('../../utils');

let initialState = {

  getInitializedState: function() {
    let state = {
      visible: true,
      page: 0,
      disabled: false,

      //selct metric
      resource: null,
      resourceType: undefined,
      metricType: undefined,
      resources: [],
      measureGranularity: 300,

      //alarm config
      name: '',
      descrition: '',
      evaluationPeriods: 1,
      granularity: 300,
      aggregationMethod: 'mean',
      comparisonOperator: 'gt',
      threshold: 5,

      //set notification
      notificationLists: [{
        id: 0,
        status: 'alarm',
        notification: 'none'
      }],
      notifications: [],
      hideError: true,
      errorMsg: ''
    };

    return state;
  },

  getModifiedState: function(alarm) {

    let rule = alarm.gnocchi_resources_threshold_rule;
    let notificationLists = [];

    alarm.alarm_actions.forEach((url) => {
      notificationLists.push({
        status: 'alarm',
        notification: utils.getNotificationIdByUrl(url)
      });
    });
    alarm.ok_actions.forEach((url) => {
      notificationLists.push({
        status: 'ok',
        notification: utils.getNotificationIdByUrl(url)
      });
    });
    alarm.insufficient_data_actions.forEach((url) => {
      notificationLists.push({
        status: 'insufficient_data',
        notification: utils.getNotificationIdByUrl(url)
      });
    });
    notificationLists = notificationLists.map((ele, i) => {
      ele.id = i;
      return ele;
    });
    if (notificationLists.length === 0) {
      notificationLists.push({
        id: 0,
        status: 'alarm',
        notification: 'none'
      });
    }

    let state = {
      visible: true,
      page: 1,
      disabled: false,

      //selct metric
      resource: null, //after update
      resourceType: rule.resource_type,
      metricType: rule.metric,
      resources: [], //after update
      measureGranularity: 300,

      //alarm config
      name: alarm.name,
      descrition: alarm.description,
      evaluationPeriods: rule.evaluation_periods,
      granularity: rule.granularity,
      aggregationMethod: rule.aggregation_method,
      comparisonOperator: rule.comparison_operator,
      threshold: rule.threshold,

      //set notification
      notificationLists: notificationLists,
      notifications: [],
      hideError: true,
      errorMsg: ''
    };

    return state;
  }

};

module.exports = initialState;
