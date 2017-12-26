const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const request = require('../../request');
const getErrorMessage = require('client/applications/dashboard/utils/error_message');
const __ = require('locale/client/dashboard.lang.json');

function pop(obj, parent) {

  config.fields[0].text = obj.name;

  let props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      request.getPools().then(res => {
        let pools = res.filter(pool => pool.protocol === obj.protocol && pool.loadbalancers[0].id === obj.loadbalancers[0].id);

        refs.resource_pool.setState({
          value: pools[0] ? pools[0].id : '',
          data: pools,
          hide: false
        });

        if(pools.length > 0) {
          refs.btn.setState({
            disabled: false
          });
        }
      });
    },
    onConfirm: function(refs, cb) {
      let data = {
        default_pool_id: refs.resource_pool.state.value
      };

      request.updateListener(obj.id, data).then(res => {
        cb(true);
      }).catch(err => {
        cb(false, getErrorMessage(err));
      });
    },
    onAction: function(field, status, refs) {}
  };

  commonModal(props);
}

module.exports = pop;
