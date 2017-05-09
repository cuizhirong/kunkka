var __ = require('locale/client/dashboard.lang.json');

module.exports = {
  getVolumeType: function(volumeType) {
    switch(volumeType) {
      case 'sata':
        return __.sata;
      case 'ssd':
        return __.ssd;
      default:
        return volumeType;
    }
  },

  getTime(time) {
    var now = new Date();
    var date;
    switch(time) {
      case 'hour':
        date = new Date(now.getTime() - 3 * 3600 * 1000 - 20 * 60 * 1000);
        break;
      case 'day':
        date = new Date(now.getTime() - 24 * 3600 * 1000 - 30 * 60 * 1000);
        break;
      case 'week':
        date = new Date(now.getTime() - 7 * 24 * 3600 * 1000 - 60 * 60 * 1000);
        break;
      case 'month':
        date = new Date(now.getTime() - 30 * 24 * 3600 * 1000);
        break;
      default:
        date = new Date(now.getTime() - 3 * 3600 * 1000 - 20 * 60 * 1000);
        break;
    }
    return date.toISOString().substr(0, 16);
  },

  ipFormat(ip) {
    var num = 0;
    ip = ip.split('.');
    num = Number(ip[0]) * 256 * 256 * 256 + Number(ip[1]) * 256 * 256 + Number(ip[2]) * 256 + Number(ip[3]);
    num = num >>> 0;
    return num;
  }
};
