var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');
var __ = require('locale/client/dashboard.lang.json');
var getErrorMessage = require('../../../../utils/error_message');

function initializeConfig(conf, router) {

  var routerName = conf.fields[0];
  var protocols = conf.fields[1];
  var sourceip = conf.fields[2];
  var sourcePort = conf.fields[3];

  routerName.text = router.name ? router.name : '(' + router.id.substr(0, 8) + ')';
  protocols.data = [{
    id: 'tcp',
    name: 'TCP'
  }, {
    id: 'udp',
    name: 'UDP'
  }];
  protocols.value = 'tcp';
  if (router.external_gateway_info) {
    let fip = router.external_gateway_info.external_fixed_ips[0];
    if (fip) {
      sourceip.icon_type = 'floating-ip';
      sourceip.text = fip.ip_address;
      sourcePort.disabled = false;
    }
  } else {
    sourceip.icon_type = undefined;
    sourceip.text = __.source_ip_empty;
    sourcePort.disabled = true;
  }

  return conf;

}

function pop(router, callback) {

  var props = {
    __: __,
    config: initializeConfig(config, router),
    onInitialize: function(refs) {
      request.getSubnets().then((subnets) => {
        let ports = [];
        router.subnets.forEach((subnet) => {
          subnets.some((sub) => {
            if (subnet.id === sub.id) {
              sub.ports.some((port) => {
                if (port.device_owner === 'compute:None') {
                  ports.push(port);
                }
              });
              return true;
            }
            return false;
          });
        });

        ports = ports.map((port) => {
          port.name = port.fixed_ips[0].ip_address;
          return port;
        });

        if (ports.length > 0) {
          refs.target_ip.setState({
            data: ports,
            value: ports[0].id
          });
          refs.target_port.setState({
            disabled: false
          });
        } else {
          refs.target_port.setState({
            disabled: true
          });
        }
      });
    },
    onConfirm: function(refs, cb) {
      let targetIpId = refs.target_ip.state.value;
      let targetPort = refs.target_ip.state.data.find((port) => port.id === targetIpId);

      let data = {
        protocol: refs.protocol.state.value,
        outside_port: refs.source_port.state.value,
        inside_addr: targetPort.fixed_ips[0].ip_address,
        inside_port: refs.target_port.state.value
      };

      request.createPortForwarding(router.id, data).then((res) => {
        callback && callback(res);
        cb(true);
      }).catch((error) => {
        cb(false, getErrorMessage(error));
      });
    },
    onAction: function(field, status, refs) {
      switch(field) {
        case 'source_port':
        case 'target_port':
          let sourcePort = refs.source_port.state.value;
          let targetPort = refs.target_port.state.value;

          refs.btn.setState({
            disabled: !(sourcePort && targetPort)
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
