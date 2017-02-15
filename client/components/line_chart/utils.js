var constant = require('./constant');

module.exports = {
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

  getTitle: function(resourceType, metricType, __) {
    if (resourceType === 'instance') {
      if (metricType) {
        switch (metricType) {
          case 'disk.read.bytes.rate':
            return __.disk_read_rate;
          case 'disk.write.bytes.rate':
            return __.disk_write_rate;
          case 'cpu_util':
            return __.cpu_utilization;
          case 'memory.usage':
            return __.memory_usage;
          case 'network.incoming.bytes.rate':
            return __.network_incoming;
          case 'network.outgoing.bytes.rate':
            return __.network_outcoming;
          default:
            return metricType;
        }
      }
      return '';
    } else if (resourceType === 'volume') {
      if (metricType) {
        switch (metricType) {
          case 'disk.device.read.bytes.rate':
            return __.disk_device_read_rate;
          case 'disk.device.write.bytes.rate':
            return __.disk_device_write_rate;
          case 'disk.device.read.requests.rate':
            return __.disk_read_raquests;
          case 'disk.device.write.requests.rate':
            return __.disk_write_raquests;
          default:
            return metricType;
        }
      }
      return '';
    }
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
  }
};
