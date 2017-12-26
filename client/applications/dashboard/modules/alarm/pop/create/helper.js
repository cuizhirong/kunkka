const __ = require('locale/client/dashboard.lang.json');

let helper = {

  getDateStr: function(date) {
    function format(num) {
      return (num < 10 ? '0' : '') + num;
    }

    return format(date.getMonth() + 1) + '-' + format(date.getDate()) +
      ' ' + format(date.getHours()) + ':' + format(date.getMinutes());
  },

  getMetricUnit: function(resourceType, metricType) {
    switch (metricType) {
      case 'cpu_util':
        return '%';
      case 'disk.device.read.bytes.rate':
      case 'disk.device.write.bytes.rate':
      case 'disk.read.bytes.rate':
      case 'disk.write.bytes.rate':
      case 'network.incoming.bytes.rate':
      case 'network.outgoing.bytes.rate':
        return 'B/s';
      case 'disk.device.read.requests.rate':
      case 'disk.device.write.requests.rate':
        return __.request_per_second;
      case 'memory.usage':
        return 'MB';
      default:
        return '';
    }
  },

  getGranularity: function(granularity) {
    let telemerty = HALO.configs.telemerty,
      hour = telemerty.hour,
      day = telemerty.day,
      week = telemerty.week,
      month = telemerty.month,
      year = telemerty.year;
    switch(granularity.toString()) {
      case '300':
        return hour;
      case '900':
        return day;
      case '3600':
        return week;
      case '21600':
        return month;
      case '86400':
        return year;
      default:
        return '60';
    }
  }

};

module.exports = helper;
