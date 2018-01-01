const __ = require('locale/client/admin.lang.json');
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
      let u = m, v = n, t = v;
      while (v !== 0){
        t = u % v;
        u = v;
        v = t;
      }
      return u;
    }
  },
  exportCSV: function(url) {
    let linkNode = document.createElement('a');
    linkNode.href = url;
    linkNode.click();
    linkNode = null;
  },
  getTime(time) {
    let now = new Date();
    let date;
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
      case 'year':
        date = new Date(now.getTime() - 365 * 24 * 3600 * 1000);
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

  getUnit: function(resourceType, metricType, arr) {
    if (resourceType === 'instance') {
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
        default:
          return 'B/s';
      }
    } else if (resourceType === 'volume') {
      switch(metricType) {
        case 'disk.device.read.bytes.rate':
        case 'disk.device.write.bytes.rate':
          return unitConverter(this.getMax(arr)).unit + '/s';
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

  ipFormat(ip) {
    let num = 0;
    ip = ip.split('.');
    num = Number(ip[0]) * 256 * 256 * 256 + Number(ip[1]) * 256 * 256 + Number(ip[2]) * 256 + Number(ip[3]);
    num = num >>> 0;
    return num;
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
  }
};
