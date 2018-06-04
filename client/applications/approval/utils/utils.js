

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

  getStringUTF8Length: function(str) {
    let m = encodeURIComponent(str).match(/%[89ABab]/g);
    return str.length + (m ? m.length : 0);
  },

  getTime(time) {
    let now = new Date();
    let date;
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
  }
};
