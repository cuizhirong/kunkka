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
  }
};
