const React = require('react');
const __ = require('locale/client/dashboard.lang.json');
//const constant = require('./pop/create/constant');
const unitConverter = require('client/utils/unit_converter');
const UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];

const hour = Number(HALO.configs.telemerty.hour),
  day = Number(HALO.configs.telemerty.day),
  week = Number(HALO.configs.telemerty.week),
  month = Number(HALO.configs.telemerty.month),
  year = Number(HALO.configs.telemerty.year);

module.exports = {
  max: function(arr) {
    let max = arr[0];
    let len = arr.length;
    for (let i = 1; i < len; i++){
      if (arr[i] > max) {
        max = arr[i];
      }
    }
    return max;
  },

  getISOTime: function(number) {
    let date = new Date();
    date.setDate(date.getDate() + number);
    return date.toISOString().substr(0, 16) + 'Z';
  },

  getNotificationIdByUrl: function(url) {
    return url.split('queue_name=')[1].split('&project_id')[0];
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
        case 'disk.device.read.bytes.rate':
          return __.disk_device_read_rate;
        case 'disk.device.write.bytes.rate':
          return __.disk_device_write_rate;
        case 'disk.device.read.requests.rate':
          return __.disk_device_read_requests_rate;
        case 'disk.device.write.requests.rate':
          return __.disk_device_write_requests_rate;
        case 'disk.read.bytes.rate':
          return __.disk_read_rate;
        case 'disk.write.bytes.rate':
          return __.disk_write_rate;
        case 'memory.usage':
          return __.memory_usage;
        case 'network.incoming.bytes.rate':
          return ip ? ip + ' ' + __.network_incoming_bytes_rate : __.network_incoming_bytes_rate;
        case 'network.outgoing.bytes.rate':
          return ip ? ip + ' ' + __.network_outgoing_bytes_rate : __.network_outgoing_bytes_rate;
        default:
          return metric;
      }
    }
    return '';
  },

  getColor: function(metric) {
    if(metric) {
      switch(metric) {
        case 'cpu.util':
        case 'disk.device.read.bytes.rate':
          return '#E0DE5D';
        case 'disk.read.bytes.rate':
        case 'disk.device.write.bytes.rate':
          return '#47C1A6';
        case 'disk.write.bytes.rate':
        case 'disk.device.read.requests.rate':
          return '#0A98E4';
        case 'memory.usage':
        case 'disk.device.write.requests.rate':
          return '#EFB16A';
        case 'network.incoming.bytes.rate':
          return '#6390EC';
        case 'network.outgoing.bytes.rate':
          return '#8787E5';
        case 'disk.usage':
          return '#87CEFA';
        default:
          return '#8787E5';
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
      case hour:
        return new Date(prev.getFullYear(), prev.getMonth(), prev.getDate(), prev.getHours(), prev.getMinutes() - 1);
      case day:
        return new Date(prev.getFullYear(), prev.getMonth(), prev.getDate(), prev.getHours(), prev.getMinutes() - 5);
      case week:
        return new Date(prev.getFullYear(), prev.getMonth(), prev.getDate(), prev.getHours(), prev.getMinutes() - 10);
      case month:
        return new Date(prev.getFullYear(), prev.getMonth(), prev.getDate(), prev.getHours() - 1, prev.getMinutes());
      case year:
        return new Date(prev.getFullYear(), prev.getMonth(), prev.getDate(), prev.getHours() - 3);
      default:
        return new Date(prev.getFullYear(), prev.getMonth(), prev.getDate(), prev.getHours() - 6);
    }
  },

  getMax(arr) {
    let arrData = [];
    arr.forEach(a => {
      arrData.push(a[2]);
    });

    return this.max(arrData);
  },

  getChartData(data, granularity, startTime, metricType, resourceType) {
    let _data = [];
    if (data.length !== 0) {
      if (resourceType) {
        let num = 0;
        if (metricType === 'disk.write.bytes.rate' || metricType === 'disk.read.bytes.rate'
          || metricType === 'network.incoming.bytes.rate' || metricType === 'network.outgoing.bytes.rate'
          || metricType === 'disk.device.read.bytes.rate' || metricType === 'disk.device.write.bytes.rate') {
          num = UNITS.indexOf(unitConverter(this.getMax(data)).unit);
        }
        data.forEach((d) => {
          _data.push(d[2].toFixed(2) / Math.pow(1024, num));
        });
      } else {
        data.forEach((d) => {
          let date = new Date(d[0]);
          _data.push(this.getDateStr(date, granularity));
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

  getTime(granularity) {
    let now = new Date();
    let date;
    switch(Number(granularity)) {
      case hour:
        date = now.getTime() - 3 * 3600 * 1000;
        break;
      case day:
        date = now.getTime() - 24 * 3600 * 1000;
        break;
      case week:
        date = now.getTime() - 7 * 24 * 3600 * 1000;
        break;
      case month:
        date = now.getTime() - 30 * 24 * 3600 * 1000;
        break;
      case year:
        date = now.getTime() - 365 * 24 * 3600 * 1000;
        break;
      default:
        date = now.getTime() - 3 * 3600 * 1000;
        break;
    }
    return date;
  },

  getUnit: function(resourceType, metricType, arr) {
    switch(metricType) {
      case 'cpu_util':
      case 'cpu.util':
      case 'disk.usage':
        return '%';
      case 'memory.usage':
        return 'MB';
      case 'disk.write.bytes.rate':
      case 'disk.read.bytes.rate':
      case 'network.incoming.bytes.rate':
      case 'network.outgoing.bytes.rate':
        return unitConverter(this.getMax(arr)).unit + '/s';
      case 'disk.device.read.bytes.rate':
      case 'disk.device.write.bytes.rate':
        return unitConverter(this.getMax(arr)).unit + '/s';
      case 'disk.device.read.requests.rate':
      case 'disk.device.write.requests.rate':
        return 'Requests/s';
      default:
        return 'B/s';
    }
  },

  getDotsNumber(granularity, prev) {
    switch (Number(granularity)) {
      case hour:
        return (60 * 60 * 3) / hour;
      case day:
        return (60 * 60 * 24) / day;
      case week:
        return (60 * 60 * 24 * 7) / week;
      case month:
        return (60 * 60 * 24 * 30) / month;
      case year:
        return (60 * 60 * 24 * 365) / year;
      default:
        return 0;
    }
  },

  getDateStr: function(date, granularity) {
    function format(num) {
      return (num < 10 ? '0' : '') + num;
    }

    switch(Number(granularity)) {
      /*case hour:
        return [format(date.getMonth() + 1) + '-' + format(date.getDate()), format(date.getHours()) + ':' + format(date.getMinutes() - 1)].join('\n');
      case day:
        return [format(date.getMonth() + 1) + '-' + format(date.getDate()), format(date.getHours()) + ':' + format(date.getMinutes() - 5)].join('\n');
      case week:
        return [format(date.getMonth() + 1) + '-' + format(date.getDate()), format(date.getHours()) + ':' + format(date.getMinutes() - 10)].join('\n');
      case month:
        return [format(date.getMonth() + 1) + '-' + format(date.getDate()), format(date.getHours() - 1) + ':' + format(date.getMinutes())].join('\n');
      case year:
        return [format(date.getFullYear()) + '-' + format(date.getMonth() + 1) + '-' + format(date.getDate()), format(date.getHours() - 3) + ':' + format(date.getMinutes())].join('\n');*/
      case year:
        return [format(date.getFullYear()) + '-' + format(date.getMonth() + 1) + '-' + format(date.getDate()), format(date.getHours()) + ':' + format(date.getMinutes())].join('\n');
      default:
        return [format(date.getMonth() + 1) + '-' + format(date.getDate()), format(date.getHours()) + ':' + format(date.getMinutes())].join('\n');
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
        case 'instance_disk':
          if (rule._volume_id) {
            let volumeShortId = '(' + rule._volume_id.substr(0, 8) + ')';

            return (
              <span>
                <i className="glyphicon icon-volume" />
                {
                  rule._volume_exist ?
                    <a data-type="router" href={'/dashboard/volume/' + rule._volume_id}>
                      {rule._volume_name ? rule._volume_name : volumeShortId }
                    </a>
                  : <span>{volumeShortId}</span>
                }
              </span>
            );
          }
          return (
            <span>
              <i className="glyphicon icon-volume" />
              <span>{'-'}</span>
            </span>
          );
        default:
          return (
            <span>{'(' + rule.resource_id.substr(0, 8) + ')'}</span>
          );
      }

    }
    return null;
  }

};
