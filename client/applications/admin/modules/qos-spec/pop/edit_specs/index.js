var React = require('react');
var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');
var __ = require('locale/client/admin.lang.json');
var getErrorMessage = require('../../../../utils/error_message');

function pop(obj, parent, callback) {

  let initialSpec = obj.specs;

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
      let specs = obj.specs;
      let data = Object.keys(specs).map((key) => ({
        key,
        value: specs[key]
      }));

      refs.specs.refs.table.setState({
        data: data
      });
    },
    onConfirm: function(refs, cb) {
      let data = refs.specs.refs.table.state.data;

      let newKeys = {};
      data.forEach((ele) => { newKeys[ele.key] = ele.value; });
      let removeKeys = Object.keys(initialSpec).filter((key) => !data.some((ele) => ele.key === key));

      let id = obj.id;
      let updateData = {
        qos_specs: newKeys
      };
      let deleteData = {
        keys: removeKeys
      };

      request.updateKeys({ id, updateData, deleteData }).then((res) => {
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
