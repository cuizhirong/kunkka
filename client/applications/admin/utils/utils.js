var __ = require('locale/client/admin.lang.json');
var constant = require('./constant');

module.exports = {
  getVolumeType: function(item) {
    switch(item.volume_type) {
      case 'sata':
        return __.sata;
      case 'ssd':
        return __.ssd;
      default:
        return item.volume_type;
    }
  },
  getCommonFactor: function(m, n) {
    if (isNaN(m) || isNaN(n)) {
      return 1;
    } else {
      var u = m, v = n, t = v;
      while (v !== 0){
        t = u % v;
        u = v;
        v = t;
      }
      return u;
    }
  },
  exportCSV: function(url) {
    var linkNode = document.createElement('a');
    linkNode.href = url;
    linkNode.click();
    linkNode = null;
  },
  getTime(time) {
    var now = new Date();
    var date;
    switch(time) {
      case 'hour':
        date = new Date(now.getTime() - 3 * 3600 * 1000);
        break;
      case 'day':
        date = new Date(now.getTime() - 24 * 3600 * 1000);
        break;
      case 'week':
        date = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
        break;
      case 'month':
        date = new Date(now.getTime() - 30 * 24 * 3600 * 1000);
        break;
      default:
        date = new Date(now.getTime() - 3 * 3600 * 1000);
        break;
    }
    return date.toISOString().substr(0, 16);
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

    return _data;
  },

  getUnit: function(resourceType, metricType) {
    if (resourceType === 'instance') {
      switch(metricType) {
        case 'cpu_util':
          return '%';
        case 'memory.usage':
          return 'MB';
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
  }
};
