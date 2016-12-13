let helper = {

  getDateStr: function(date) {
    function format(num) {
      return (num < 10 ? '0' : '') + num;
    }

    return format(date.getMonth()) + '-' + format(date.getDate()) +
      ' ' + format(date.getHours()) + ':' + format(date.getMinutes());
  },

  getMetricUnit: function(resourceType, metricType) {
    if (resourceType === 'instance') {
      switch (metricType) {
        case 'cpu_util':
        case 'memory.usage':
          return '%';
        case 'disk.read.bytes.rate':
        case 'disk.write.bytes.rate':
        default:
          return 'b/s';
      }
    }
  }

};

module.exports = helper;
