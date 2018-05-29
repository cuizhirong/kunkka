const React = require('react');
const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const request = require('../../request');
const getErrorMessage = require('client/applications/admin/utils/error_message');

const InstanceList = require('./render.jsx');

function renderer(props) {
  return <InstanceList {...props} />;
}

function isInOneHost(hosts) {
  const map = {};
  const tempArr = [];
  hosts.forEach((host) => {
    if(!(host in map)) {
      map[host] = host;
      tempArr.push(host);
    }
  });

  if(tempArr.length === 1) {
    return true;
  } else {
    return false;
  }
}

function pop(obj, parent, callback) {
  let {rows, hostTypes} = obj;
  let allHosts = [],
    dataCopy = [];

  rows.forEach((instance) => {
    let itemStatus = instance.status.toLowerCase(),
      isCool = false;
    if (itemStatus === 'active' || itemStatus === 'paused') {
      isCool = false;
    } else if (itemStatus !== 'error' && itemStatus !== 'error_deleting') {
      isCool = true;
    }

    allHosts.push(instance['OS-EXT-SRV-ATTR:host']);
    dataCopy.push({
      project_name: __.loading,
      project_id: instance.tenant_id,
      name: instance.name,
      id: instance.id,
      isCool: isCool
    });
  });

  const inOneHost = isInOneHost(allHosts);

  let hosts = [];
  hosts.push({
    id: 'auto',
    name: __.auto
  });

  if(inOneHost) {
    hostTypes.forEach((host) => {
      let name = host.service.host;

      if (name !== allHosts[0]) {
        hosts.push({
          id: name,
          name: name
        });
      }
    });
  }


  let props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      let btnDisabled;
      if(hosts.length === 1) {
        btnDisabled = true;
      } else {
        btnDisabled = false;
      }

      refs.btn.setState({
        disabled: btnDisabled
      });

      refs.migrate_to.setState({
        data: hosts,
        value: hosts[0].id
      });

      refs.instance.setState({
        renderer: renderer,
        instances: dataCopy
      });

      dataCopy.forEach((instance) => {
        request.getProjectById(instance.project_id).then((res) => {
          instance.project_name = res.project.name;
          refs.instance.setState({
            instances: Object.assign([], dataCopy)
          });
        });
      });
    },
    onConfirm: function(refs, cb) {
      let hostID = refs.migrate_to.state.value;
      if (hostID === 'auto') {
        hostID = null;
      }

      request.batchMigrate(dataCopy, hostID).then((res) => {
        callback && callback(res);
        cb(true);
      }).catch(function(error) {
        cb(false, getErrorMessage(error));
      });
    },
    onAction: function(field, state, refs) {
    },
    onLinkClick: function() {
    }
  };

  commonModal(props);
}

module.exports = pop;
