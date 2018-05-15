const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const request = require('../../request');
const __ = require('locale/client/admin.lang.json');

function pop(rows, refresh) {
  let types = [];
  let defaultValue = 0;
  let props = {
    __: __,
    config: config,
    onInitialize: function(refs) {
      request.getVolumeType().then((res) => {
        types = res;
        types.shift();
        types.forEach((i, index) => {
          i.disabled = false;
          i.id = index;
          defaultValue = i.name === rows[0].volume_type ? index : defaultValue;
        });
        refs['volume-type'].setState({
          data: types,
          value: defaultValue
        });
      });
    },
    onConfirm: function(refs, cb) {
      if (types.length === 0) {
        cb(false, 'Getting types ...');
        return;
      }
      if ((defaultValue === refs['volume-type'].state.value || refs['volume-type'].state.value === '') && types.length === 1) {
        cb(true);
        return;
      }
      let selectedType = types[refs['volume-type'].state.value].name;
      request.retypeVolume(selectedType, 'on-demand', rows).then((res) => {
        cb(true);
        refresh({
          refreshList: true,
          refreshDetail: true,
          loadingTable: true,
          loadingDetail: true
        });
      }).catch(res => {
        cb(false, res);
      });
    },
    onAction: function(field, state, refs) {}
  };

  commonModal(props);
}

module.exports = pop;
