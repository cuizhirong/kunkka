var __ = require('locale/client/admin.lang.json');

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
  }
};
