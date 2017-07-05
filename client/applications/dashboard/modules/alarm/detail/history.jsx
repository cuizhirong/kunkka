var utils = require('../utils');
var __ = require('locale/client/dashboard.lang.json');
var moment = require('client/libs/moment');

module.exports = {

  getHistoryConfig: function(data) {

    var datas = data.map((ele, i) => {
      let type = '';
      let action = '';
      let detail = JSON.parse(ele.detail);
      let timestamp = ele.timestamp.split('.')[0] + 'Z';

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
            action = ele.detail;
          }
          break;
        case 'state transition':
          type = __.state_transition;
          action = detail.state ? __.transition_to + utils.getStateName(detail.state) : '';
          break;
        case 'deletion':
          type = __.deletion;
          break;
        default:
          type = ele.type;
          break;
      }

      return {
        timestamp: moment(timestamp).format('YYYY-MM-DD HH:mm:ss'),
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

};
