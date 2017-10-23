const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const request = require('../../request');
const __ = require('locale/client/admin.lang.json');
const Filter = require('../../../../components/csv_filter/index');

config.fields[0].value = 'hosts';

function pop(obj, parent, callback) {

  let props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      refs.exp_filter.setState({
        renderer: Filter,
        fields: obj.fields,
        noCalendar: true
      });
    },
    onConfirm: function(refs, cb) {
      let filter = refs.exp_filter.state.value;
      let filename = refs.exp_title.state.value;
      let startTime = filter.startTime;
      let endTime = filter.endTime;
      let fields = filter && filter.fields.length > 0 ? filter.fields.join(',') : '';
      let data = {
        filename: filename
      };
      if(startTime) {
        data.start_time = startTime;
      }
      if(endTime) {
        data.end_time = endTime;
      }
      if(fields) {
        data.fields = fields;
      }
      request.exportCSV(data).then((res) => {
        cb(true);
      });
    },
    onAction: function(field, state, refs) {
      let reg = /^[0-9a-zA-Z_+-.]+$/;
      switch(field) {
        case 'exp_title':
          refs.exp_title.setState({
            error: !reg.test(state.value)
          });
          break;
        default:
          return;
      }
      refs.btn.setState({
        disabled: !reg.test(state.value)
      });
    }
  };

  commonModal(props);
}

module.exports = pop;
