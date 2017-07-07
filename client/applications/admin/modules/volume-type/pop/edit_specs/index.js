var React = require('react');
var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');
var __ = require('locale/client/admin.lang.json');
var getErrorMessage = require('../../../../utils/error_message');

function pop(obj, parent, callback) {

  let initialSpecs = obj.extra_specs;

  let kvTable = config.fields[0];
  let column = [{
    title: __.key,
    key: 'key',
    dataIndex: 'key'
  }, {
    title: __.value,
    key: 'value',
    dataIndex: 'value'
  }];
  kvTable.table = {
    column,
    dataKey: 'key'
  };

  let keyInput, valueInput;
  kvTable.inputs = [{
    key: 'key',
    content: <input placeholder={__.key} ref={(ref) => { keyInput = ref; }} />
  }, {
    key: 'value',
    content: <input placeholder={__.value} ref={(ref) => { valueInput = ref; }} />
  }];

  var props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      let data = Object.keys(initialSpecs).map((key) => ({
        key,
        value: initialSpecs[key]
      }));

      refs.specs.refs.table.setState({
        data: data
      });
    },
    onConfirm: function(refs, cb) {
      let data = refs.specs.refs.table.state.data;

      let updateKeys = {};
      data.forEach((ele) => { updateKeys[ele.key] = ele.value; });
      let updateData = {
        extra_specs: updateKeys
      };

      let deleteKeys = Object.keys(initialSpecs).filter((key) => !data.some((ele) => ele.key === key));

      request.deleteAndUpdateExtraSpecs(obj.id, { updateData, deleteKeys }).then((res) => {
        callback && callback(res);
        cb(true);
      }).catch((err) => {
        cb(false, getErrorMessage(err));
      });
    },
    onAction: function(field, state, refs) {
      switch(field) {
        case 'specs':
          if (keyInput.value && valueInput.value) {
            const table = refs.specs.refs.table;
            let data = table.state.data;
            data.push({
              key: keyInput.value,
              value: valueInput.value
            });
            table.setState({
              data: data
            });

            keyInput.value = '';
            valueInput.value = '';
          }
          break;
        default:
          return;
      }
    }
  };

  commonModal(props);
}

module.exports = pop;
