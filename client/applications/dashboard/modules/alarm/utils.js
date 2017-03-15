var React = require('react');
var __ = require('locale/client/dashboard.lang.json');
var constant = require('./pop/create/constant');

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

  getMetricName: function(metric, ip) {
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
          return ip + ' ' + __.network_incoming_bytes_rate;
        case 'network.outgoing.bytes.rate':
          return ip + ' ' + __.network_outgoing_bytes_rate;
        case 'disk.device.read.bytes.rate':
          return __.disk_device_read_rate;
        case 'disk.device.write.bytes.rate':
          return __.disk_device_write_rate;
        case 'disk.device.read.requests.rate':
          return __.disk_read_raquests;
        case 'disk.device.write.requests.rate':
          return __.disk_write_raquests;
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

  getNextPeriodDate: function(prev, granularity) {
    switch (Number(granularity)) {
      case constant.GRANULARITY_HOUR:
        return new Date(prev.getFullYear(), prev.getMonth(), prev.getDate(), prev.getHours(), prev.getMinutes() - 5);
      case constant.GRANULARITY_DAY:
        return new Date(prev.getFullYear(), prev.getMonth(), prev.getDate(), prev.getHours(), prev.getMinutes() - 15);
      case constant.GRANULARITY_WEEK:
        return new Date(prev.getFullYear(), prev.getMonth(), prev.getDate(), prev.getHours() - 1);
      case constant.GRANULARITY_MONTH:
      default:
        return new Date(prev.getFullYear(), prev.getMonth(), prev.getDate(), prev.getHours() - 6);
    }
  },

  getChartData(data, granularity, startTime, resourceType) {
    var _data = [];
    if (data.length !== 0) {
      if (resourceType && (resourceType === 'instance' || resourceType === 'volume')) {
        data.forEach((d) => {
          _data.push(d[2].toFixed(2));
        });
      } else {
        data.forEach((d) => {
          let date = new Date(d[0]);
          _data.push(this.getDateStr(date));
        });
      }

      let prev;
      if (data.length > 0) {
        prev = new Date(data[0][0]);
      } else {
        prev = new Date();
      }

      const DOTS_NUM = this.getDotsNumber(granularity, prev);

      if (data.length < DOTS_NUM) {
        let length = DOTS_NUM - data.length;

        while (length > 0) {
          prev = this.getNextPeriodDate(prev, granularity);
          let unData = resourceType ? 0 : this.getDateStr(prev, granularity);
          _data.unshift(unData);
          length--;
        }
      }
    }

    return _data;
  },

  getUnit: function(resourceType, metricType) {
    if (resourceType === 'instance') {
      switch(metricType) {
        case 'cpu_util':
          return '%';
        case 'memory.usage':
          return 'MB/s';
        case 'disk.read.bytes.rate':
        case 'disk.write.bytes.rate':
        case 'network.incoming.bytes.rate':
        case 'network.outgoing.bytes.rate':
        default:
          return 'B/s';
      }
    } else if (resourceType === 'volume') {
      switch(metricType) {
        case 'disk.device.read.bytes.rate':
        case 'disk.device.write.bytes.rate':
          return 'B/s';
        case 'disk.device.read.requests.rate':
        case 'disk.device.write.requests.rate':
          return 'Requests/s';
        default:
          return 'B/s';
      }
    }
  },

  getDotsNumber(granularity, prev) {
    switch (Number(granularity)) {
      case constant.GRANULARITY_HOUR:
        return 36;
      case constant.GRANULARITY_DAY:
        return 96;
      case constant.GRANULARITY_WEEK:
        return 168;
      case constant.GRANULARITY_MONTH:
        let date = new Date(prev.getFullYear(), prev.getMonth(), 0);
        return 4 * date.getDate();
      default:
        return 0;
    }
  },

  getDateStr: function(date, granularity) {
    function format(num) {
      return (num < 10 ? '0' : '') + num;
    }
    switch(granularity) {
      case constant.GRANULARITY_HOUR:
        return format(date.getMonth() + 1) + '-' + format(date.getDate()) +
          ' ' + format(date.getHours()) + ':' + format(date.getMinutes() - 5);
      case constant.GRANULARITY_DAY:
        return format(date.getMonth() + 1) + '-' + format(date.getDate()) +
          ' ' + format(date.getHours()) + ':' + format(date.getMinutes() - 15);
      case constant.GRANULARITY_WEEK:
        return format(date.getMonth() + 1) + '-' + format(date.getDate()) +
          ' ' + format(date.getHours() - 1) + ':' + format(date.getMinutes());
      case constant.GRANULARITY_MONTH:
        return format(date.getMonth() + 1) + '-' + format(date.getDate()) +
          ' ' + format(date.getHours() - 6) + ':' + format(date.getMinutes());
      default:
        return format(date.getMonth() + 1) + '-' + format(date.getDate()) +
          ' ' + format(date.getHours()) + ':' + format(date.getMinutes());
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
