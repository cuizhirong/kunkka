var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');
var __ = require('locale/client/admin.lang.json');
var getErrorMessage = require('../../../../utils/error_message');

function pop(obj, parent, callback) {
  if (HALO.settings.enable_charge) {
    config.fields[5].hide = false;
  }
  var props = {
    __: __,
    parent: parent,
    config: config,
    onConfirm: function(refs, cb) {
      var data = {
        flavor: {
          name: refs.name.state.value,
          ram: Number(refs.memory_gb.state.value) * 1024,
          vcpus: Number(refs.vcpu.state.value),
          disk: Number(refs.capacity_gb.state.value)
        }
      };

      var id = refs.id.state.value;
      if (id) {
        data.flavor.id = id;
      }

      let extraSpecs = refs.extra_specs.state.value,
        dataSpecs = '';
      if(extraSpecs) {
        dataSpecs = JSON.parse(extraSpecs);
      } else {
        dataSpecs = { 'hw_video:ram_max_mb': '64' };
      }

      request.createFlavor(data).then((res) => {
        if(res.flavor.id) {
          request.createExtraSpecs(res.flavor.id, dataSpecs).then((_res) => {
            cb(true);
            callback && callback(_res);
          }).catch((error) => {
            refs.error.setState({
              value: getErrorMessage(error),
              hide: false
            });
            cb(true);
          });
        }
      }).catch((err) => {
        var reg = new RegExp('"message":"(.*)","');
        var tip = reg.exec(err.response)[1];

        refs.error.setState({
          value: tip,
          hide: false
        });
        cb(false);
      });
    },
    onAction: function(field, state, refs) {
      var name = refs.name.state,
        ram = refs.memory_gb.state,
        vcpus = refs.vcpu.state,
        disk = refs.capacity_gb.state,
        specs = refs.extra_specs.state,
        flag = name.value && ram.value && vcpus.value && disk.value && !name.error && !specs.error;

      switch(field) {
        case 'name':
          var regex = /^[a-zA-Z0-9_.]{1,}$/;
          if(regex.exec(state.value)) {
            refs.name.setState({
              error: false
            });
          } else {
            refs.name.setState({
              error: true
            });
          }
          break;
        case 'extra_specs':
          try {
            JSON.parse(specs.value);
            refs.extra_specs.setState({
              error: false
            });
          } catch(err) {
            if(specs.value === '') {
              refs.extra_specs.setState({
                error: false
              });
            } else {
              refs.extra_specs.setState({
                error: true
              });
            }
          }
          break;
        default:
          break;
      }

      refs.btn.setState({
        disabled: !flag
      });

    },
    onLinkClick: function() {

    }
  };

  commonModal(props);
}

module.exports = pop;
