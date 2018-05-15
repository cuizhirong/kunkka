const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const request = require('../../request');
const __ = require('locale/client/admin.lang.json');
const getErrorMessage = require('../../../../../admin/utils/error_message');

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
        refs.btn.setState({
          disabled: false
        });
      });
    },
    onConfirm: function(refs, cb) {
      if ((defaultValue === refs['volume-type'].state.value || refs['volume-type'].state.value === '') && rows.length === 1) {
        cb(true);
        refresh({
          refreshList: true,
          refreshDetail: true,
          loadingTable: true,
          loadingDetail: true
        });
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
      }).catch(err => {
        cb(false, getErrorMessage(err));
      });
    },
    onAction: function(field, state, refs) {}
  };

  commonModal(props);
}

module.exports = pop;
