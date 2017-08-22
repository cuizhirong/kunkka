var React = require('react');
var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');
var __ = require('locale/client/admin.lang.json');

function pop(obj, parent, callback) {

  let keyVal = config.fields[8];

  let keyInput, valueInput;
  keyVal.inputs = [{
    key: 'key',
    content: <input placeholder={__.key} ref={(ref) => {keyInput = ref; }} />
  }, {
    key: 'value',
    content: <input placeholder={__.value} ref={(ref) => {valueInput = ref; }} />
  }];

  var props = {
    __: __,
    config: config,
    parent: parent,
    onInitialize: function(refs) {
      let identifierType = [{
        id: 'id',
        name: __.id
      }, {
        id: 'name',
        name: __.name
      }];

      refs.identifier_type.setState({
        data: identifierType,
        value: identifierType[0].id
      });

      request.getVolumeType().then(volumeTypes => {
        request.getAvailabilityZone().then(zones => {
          refs['volume-type'].setState({
            data: volumeTypes,
            value: volumeTypes[0].id,
            hide: false
          });
          refs['availability-zones'].setState({
            data: zones,
            value: zones[0].id,
            hide: false
          });
        });
      });
    },
    onConfirm: function(refs, cb) {
      let type = refs.identifier_type.state.value;
      let metadata = refs.metadata.state.data;
      let data = {
        volume: {
          name: refs.volume_name.state.value,
          description: refs.description.state.value,
          availability_zones: refs['availability-zones'].state.value,
          bootable: refs.bootable.state.checked,
          host: refs.hosts.state.value,
          ref: {}
        }
      };

      data.volume.ref['source-' + type] = refs.identifier.state.value;
      if (metadata.length > 0) {
        data.volume.metadata = {};
        metadata.forEach(meta => {
          data.volume.metadata[meta.key] = meta.value;
        });
      }

      if (refs['volume-type'].state.value !== 'no_volume_type') {
        data.volume.volume_type = refs['volume-type'].state.value;
      }

      request.manageVolume(data).then(res => {
        callback && callback();
        cb(true);
      }).catch(error => {
        cb(false);
      });

    },
    onAction: function(field, status, refs) {
      let host = refs.hosts.state.value;
      let identifier = refs.identifier.state.value;

      switch(field) {
        case 'identifier':
        case 'hosts':
          refs.btn.setState({
            disabled: !(host && identifier)
          });
          break;
        case 'metadata':
          let val = refs.metadata.state.data;
          val.push({
            key: keyInput.value,
            value: valueInput.value
          });

          refs.metadata.setState({
            data: val
          });
          keyInput.value = '';
          valueInput.value = '';
          break;
        default:
          break;
      }
    }
  };

  commonModal(props);

}

module.exports = pop;
