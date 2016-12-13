var React = require('react');
var __ = require('locale/client/dashboard.lang.json');

module.exports = {

  getNotificationIdByUrl: function(url) {
    return url.split('/v1/topics/')[1].split('/alarm')[0];
  },

  getComparisionName: function(comparision) {
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
  },

  getMetricName: function(metric) {
    if (metric) {
      switch (metric) {
        case 'disk.read.bytes.rate':
          return __.disk_read_rate;
        case 'disk.write.bytes.rate':
          return __.disk_write_rate;
        case 'cpu_util':
          return __.cpu_utilization;
        case 'memory.usage':
          return __.memory_usage;
        default:
          return metric;
      }
    }
    return '';
  },

  getStateName: function(state) {
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
  },

  getResourceComponent: function(item) {
    if (item.gnocchi_resources_threshold_rule) {
      let rule = item.gnocchi_resources_threshold_rule;

      return (
        <span>
          <i className="glyphicon icon-instance" />
          {
            rule.resource_name ?
              <a data-type="router" href={'/dashboard/instance/' + rule.resource_id}>
                {rule.resource_name}
              </a>
            : <span>
                {'(' + rule.resource_id.substr(0, 8) + ')'}
              </span>
          }
        </span>
      );
    }
    return null;
  }

};
