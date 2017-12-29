const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const request = require('../../request');
const __ = require('locale/client/dashboard.lang.json');
const getErrorMessage = require('../../../../utils/error_message');

function initializeConfig(conf, router) {

  let routerName = conf.fields[0];
  let protocols = conf.fields[1];
  let sourceip = conf.fields[2];
  let sourcePort = conf.fields[3];

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

  let props = {
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
        portforwarding: {
          router_id: router.id,
          outside_port: Number(refs.source_port.state.value),
          outside_addr: router.external_gateway_info.external_fixed_ips[0].ip_address,
          inside_port: Number(refs.target_port.state.value),
          inside_addr: targetPort.fixed_ips[0].ip_address,
          protocol: refs.protocol.state.value
        }
      };

      request.createPortForwarding(router.id, data).then((res) => {
        callback && callback(res);
        cb(true);
      }).catch((error) => {
        cb(false, getErrorMessage(error));
      });
    },
    onAction: function(field, status, refs) {
      let sourcePort = refs.source_port.state.value,
        targetPort = refs.target_port.state.value,
        re = /^[1-9]+[0-9]*]*$/,
        testSource = re.test(sourcePort),
        testTarget = re.test(targetPort);
      switch(field) {
        case 'source_port':
          refs.source_port.setState({
            error: !testSource
          });

          refs.btn.setState({
            disabled: !(sourcePort && targetPort && testSource && testTarget)
          });
          break;
        case 'target_port':
          refs.target_port.setState({
            error: !testTarget
          });

          refs.btn.setState({
            disabled: !(sourcePort && targetPort && testSource && testTarget)
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
