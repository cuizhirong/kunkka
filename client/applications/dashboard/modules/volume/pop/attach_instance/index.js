const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const request = require('../../request');
const __ = require('locale/client/dashboard.lang.json');

function pop(obj, parent, callback) {
  config.fields[0].text = obj.name;

  let props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      request.getInstances().then((instances) => {
        let data = [];

        instances.forEach((ele) => {
          if (ele.status === 'ACTIVE') {
            data.push({
              id: ele.id,
              name: ele.name + ' (' + ele.id.substr(0, 8) + ')'
            });
          }
        });

        refs.instance.setState({
          data: data
        });
      });
    },
    onConfirm: function(refs, cb) {
      let selected = refs.instance.state.value;
      if (selected) {
        request.attachInstance({
          serverId: selected,
          volumeId: obj.id
        }).then((res) => {
          callback && callback(res);
          cb(true);
        });
      }
    },
    onAction: function(field, status, refs) {
      switch (field) {
        case 'instance':
          refs.btn.setState({
            disabled: !status.value
          });
          break;
        default:
          break;
      }
    }
  };

  commonModal(props);
}

module.exports = pop;
