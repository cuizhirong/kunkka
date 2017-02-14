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
        case 'cpu_util':
          return __.cpu_utilization;
        case 'disk.read.bytes.rate':
          return __.disk_read_rate;
        case 'disk.read.requests.rate':
          return __.disk_read_requests_rate;
        case 'disk.write.bytes.rate':
          return __.disk_write_rate;
        case 'disk.write.requests.rate':
          return __.disk_write_requests_rate;
        case 'memory.usage':
          return __.memory_usage;
        case 'network.incoming.bytes.rate':
          return __.network_incoming_bytes_rate;
        case 'network.outgoing.bytes.rate':
          return __.network_outgoing_bytes_rate;
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

      switch (rule.resource_type) {
        case 'instance_network_interface':
          if (rule._port_id) {
            let portShortId = '(' + rule._port_id.substr(0, 8) + ')';

            return (
              <span>
                <i className="glyphicon icon-port" />
                {
                  rule._port_exist ?
                    <a data-type="router" href={'/dashboard/port/' + rule._port_id}>
                      {rule._port_name ? rule._port_name : portShortId }
                    </a>
                  : <span>{portShortId}</span>
                }
              </span>
            );
          }
          return (
            <span>
              <i className="glyphicon icon-port" />
              <span>{'-'}</span>
            </span>
          );
        case 'instance':
        case 'volume':
          return (
            <span>
              <i className={'glyphicon icon-' + rule.resource_type} />
              {
                rule.resource_name ?
                  <a data-type="router" href={'/dashboard/' + rule.resource_type + '/' + rule.resource_id}>
                    {rule.resource_name}
                  </a>
                : <span>{'(' + rule.resource_id.substr(0, 8) + ')'}</span>
              }
            </span>
          );
        default:
          break;
      }

    }
    return null;
  }

};
