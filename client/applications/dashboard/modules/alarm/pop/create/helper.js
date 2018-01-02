const __ = require('locale/client/dashboard.lang.json');
const year = Number(HALO.configs.telemerty.year);

let helper = {

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
  }

};

module.exports = helper;
