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
  }

};

module.exports = helper;
