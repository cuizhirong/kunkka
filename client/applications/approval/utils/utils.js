var __ = require('locale/client/approval.lang.json');

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
    var m = encodeURIComponent(str).match(/%[89ABab]/g);
    return str.length + (m ? m.length : 0);
  }
};
