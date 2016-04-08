var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');
var __ = require('locale/client/dashboard.lang.json');

function pop(item, direction, securityGroups, callback) {

  var rules = ['All TCP', 'All UDP', 'SSH', 'MySQL', 'DNS', 'RDP', 'HTTP', 'HTTPS', 'POP3',
    'POP3S', 'SMTP', 'SMTPS', 'IMAP', 'IMAPS'];

  var protocols = [
    { id: 'all_protocols', name: __.all_protocols },
    { id: 'tcp', name: 'TCP' },
    { id: 'udp', name: 'UDP' },
    { id: 'icmp', name: 'ICMP'}
  ];

  var targets = [
    { id: 'any', name: __.any },
    { id: 'cidr', name: 'CIDR' },
    { id: 'security_group', name: __.security_group }
  ];

  var icmpTypes = [
    { id: 'all', name: __.all },
    { id: 'dest_unreach', name: __.dest_unreach, code: 3 },
    { id: 'source_quench', name: __.source_quench, code: 4 },
    { id: 'redirect_message', name: __.redirect_message, code: 5 },
    { id: 'echo', name: __.echo, code: 8 },
    { id: 'echo_reply', name: __.echo_reply, code: 0 },
    { id: 'router_advertisement', name: __.router_advertisement, code: 9 },
    { id: 'router_solicitation', name: __.router_solicitation, code: 10 },
    { id: 'time_exceeded', name: __.time_exceeded, code: 11 },
    { id: 'bad_ip_header', name: __.bad_ip_header, code: 12 },
    { id: 'timestamp', name: __.timestamp, code: 13 },
    { id: 'timestamp_reply', name: __.timestamp_reply, code: 14 },
    { id: 'information_request', name: __.information_request, code: 15 },
    { id: 'information_reply', name: __.information_reply, code: 16 },
    { id: 'address_mask_request', name: __.address_mask_request, code: 17 },
    { id: 'address_mask_reply', name: __.address_mask_reply, code: 18 }
  ];

  var icmpMaps = {
    all: [{ id: 'empty', name: ' ' }],
    dest_unreach: [
      { id: 'dest_network_unreach', name: __.dest_network_unreach, code: 0 },
      { id: 'dest_host_unreach', name: __.dest_host_unreach, code: 1 },
      { id: 'dest_protocol_unreach', name: __.dest_protocol_unreach, code: 2 },
      { id: 'dest_port_unreach', name: __.dest_port_unreach, code: 3 },
      { id: 'fragment_required', name: __.fragment_required, code: 4 },
      { id: 'source_route_failed', name: __.source_route_failed, code: 5 },
      { id: 'dest_network_unknown', name: __.dest_network_unknown, code: 6 },
      { id: 'dest_host_unknown', name: __.dest_host_unknown, code: 7 },
      { id: 'source_host_isolated', name: __.source_host_isolated, code: 8 },
      { id: 'network_adminly_prohibited', name: __.network_adminly_prohibited, code: 9 },
      { id: 'host_adminly_prohibited', name: __.host_adminly_prohibited, code: 10 },
      { id: 'network_unreach_for_tos', name: __.network_unreach_for_tos, code: 11 },
      { id: 'host_unreach_for_tos', name: __.host_unreach_for_tos, code: 12 },
      { id: 'communication_adminly_prohibited', name: __.communication_adminly_prohibited, code: 13 }
    ],
    source_quench: [{ id: 'source_quench_congestion_ctrl', name: __.source_quench_congestion_ctrl, code: 0 }],
    redirect_message: [
      { id: 'redirect_for_network', name: __.redirect_for_network, code: 0 },
      { id: 'redirect_for_host', name: __.redirect_for_host, code: 1 },
      { id: 'redirect_for_tos_network', name: __.redirect_for_tos_network, code: 2 },
      { id: 'redirect_for_tos_host', name: __.redirect_for_tos_host, code: 3 }
    ],
    echo: [{ id: 'echo_request_for_ping', name: __.echo_request_for_ping, code: 0 }],
    echo_reply: [{ id: 'echo_reply_for_ping', name: __.echo_reply_for_ping }],
    router_advertisement: [{ id: 'router_advertisement', name: __.router_advertisement, code: 0 }],
    router_solicitation: [{ id: 'router_solicitation_etc', name: __.router_solicitation_etc, code: 0 }],
    time_exceeded: [
      { id: 'ttl_expired_in_transit', name: __.ttl_expired_in_transit, code: 0 },
      { id: 'fragment_time_exceeded', name: __.fragment_time_exceeded, code: 1 }
    ],
    bad_ip_header: [
      { id: 'pointer_indicates_error', name: __.pointer_indicates_error, code: 0 },
      { id: 'miss_option', name: __.miss_option, code: 1 },
      { id: 'bad_length', name: __.bad_length, code: 2 }
    ],
    timestamp_request: [{ id: 'timestamp_request', name: __.timestamp_request, code: 0 }],
    timestamp_reply: [{ id: 'timestamp_reply', name: __.timestamp_reply, code: 0 }],
    information_request: [{ id: 'information_request', name: __.information_request, code: 0 }],
    information_reply: [{ id: 'information_reply', name: __.information_reply, code: 0 }],
    address_mask_request: [{ id: 'address_mask_request', name: __.address_mask_request, code: 0 }],
    address_mask_reply: [{ id: 'address_mask_reply', name: __.address_mask_reply, code: 0 }]
  };

  function setProtocolAndPortRange (refs, protocol, portRange) {
    refs.protocol.setState({
      value: protocol
    });
    refs.port_range.setState({
      value: portRange
    });
  }

  function onClickRule(status, refs) {
    switch(status.value) {
      case 'All TCP':
        setProtocolAndPortRange(refs, 'tcp', '1 - 65535');
        break;
      case 'All UDP':
        setProtocolAndPortRange(refs, 'udp', '1 - 65535');
        break;
      case 'SSH':
        setProtocolAndPortRange(refs, 'tcp', '22');
        break;
      case 'MySQL':
        setProtocolAndPortRange(refs, 'tcp', '3306');
        break;
      case 'DNS':
        setProtocolAndPortRange(refs, 'udp', '53');
        break;
      case 'RDP':
        setProtocolAndPortRange(refs, 'tcp', '3389');
        break;
      case 'HTTP':
        setProtocolAndPortRange(refs, 'tcp', '80');
        break;
      case 'HTTPS':
        setProtocolAndPortRange(refs, 'tcp', '443');
        break;
      case 'POP3':
        setProtocolAndPortRange(refs, 'tcp', '110');
        break;
      case 'POP3S':
        setProtocolAndPortRange(refs, 'tcp', '995');
        break;
      case 'SMTP':
        setProtocolAndPortRange(refs, 'tcp', '25');
        break;
      case 'SMTPS':
        setProtocolAndPortRange(refs, 'tcp', '465');
        break;
      case 'IMAP':
        setProtocolAndPortRange(refs, 'tcp', '143');
        break;
      case 'IMAPS':
        setProtocolAndPortRange(refs, 'tcp', '993');
        break;
      default:
        break;
    }
  }

  function setHide(element, hide) {
    element.setState({
      hide: hide
    });
  }

  function onClickProtocol(status, refs) {
    refs.rules.setState({
      value: null
    });
    switch(status.value) {
      case 'all_protocols':
        setHide(refs.icmp_type, true);
        setHide(refs.icmp_code, true);
        refs.port_range.setState({
          hide: true
        });
        break;
      case 'tcp':
      case 'udp':
        setHide(refs.icmp_type, true);
        setHide(refs.icmp_code, true);
        refs.port_range.setState({
          hide: false
        });
        break;
      case 'icmp':
        setHide(refs.icmp_type, false);
        setHide(refs.icmp_code, false);
        refs.port_range.setState({
          hide: true
        });
        break;
      default:
        break;
    }
  }

  function onClickTarget(status, refs) {
    switch(status.value) {
      case 'any':
        setHide(refs.cidr, true);
        setHide(refs.security_group, true);
        break;
      case 'cidr':
        setHide(refs.cidr, false);
        setHide(refs.security_group, true);
        break;
      case 'security_group':
        setHide(refs.cidr, true);
        setHide(refs.security_group, false);
        break;
      default:
        break;
    }
  }

  function onClickIcmpType(status, refs) {
    var icmpCodes = icmpMaps[status.value];
    switch(status.value) {
      case 'all':
        refs.icmp_code.setState({
          data: icmpCodes,
          value: icmpCodes[0].id,
          disabled: true
        });
        break;
      default:
        refs.icmp_code.setState({
          data: icmpCodes,
          value: icmpCodes[0].id,
          disabled: false
        });
        break;
    }
  }

  var props = {
    __: __,
    config: config,
    onInitialize: function(refs) {
      refs.rules.setState({
        data: rules
      });

      refs.protocol.setState({
        data: protocols,
        value: protocols[0].id
      });

      refs.target.setState({
        data: targets,
        value: targets[0].id
      });

      refs.icmp_type.setState({
        data: icmpTypes,
        value: icmpTypes[0].id
      });

      refs.security_group.setState({
        data: securityGroups,
        value: securityGroups[0].id
      });
    },
    onConfirm: function(refs, cb) {
      var sgRule = {};

      sgRule.direction = direction;
      sgRule.security_group_id = item.id;

      var target = refs.target.state.value;
      switch(target) {
        case 'any':
          sgRule.remote_ip_prefix = '0.0.0.0/0';
          break;
        case 'cidr':
          sgRule.remote_ip_prefix = refs.cidr.state.value;
          break;
        case 'security_group':
          sgRule.remote_group_id = refs.security_group.state.value;
          break;
        default:
          break;
      }

      var protocol = refs.protocol.state.value;
      var portRange = refs.port_range.state.value;
      switch(protocol) {
        case 'all_protocols':
          sgRule.port_range_min = null;
          sgRule.port_range_max = null;
          break;
        case 'tcp':
          sgRule.protocol = 'tcp';
          var tcpranges = portRange.split('-');
          var tcprangeMin = Number(tcpranges[0]);
          sgRule.port_range_min = tcprangeMin;
          sgRule.port_range_max = tcpranges[1] ? Number(tcpranges[1]) : tcprangeMin;
          break;
        case 'udp':
          sgRule.protocol = 'udp';
          var udpranges = portRange.split('-');
          var udprangeMin = Number(udpranges[0]);
          sgRule.port_range_min = udprangeMin;
          sgRule.port_range_max = udpranges[1] ? Number(udpranges[1]) : udprangeMin;
          break;
        case 'icmp':
          sgRule.protocol = 'icmp';
          var icmpType = refs.icmp_type.state.value;
          var icmpCode = refs.icmp_code.state.value;
          if (icmpType !== 'all') {
            sgRule.port_range_min = icmpTypes.filter((ele) => ele.id === icmpType)[0].code;
            sgRule.port_range_max = icmpMaps[icmpType].filter((ele) => ele.id === icmpCode)[0].code;
          }
          break;
        default:
          break;
      }

      request.addSecurityGroupRule(sgRule).then((res) => {
        if (res.status === 409) {
          let errMsg = JSON.parse(res.responseText).NeutronError.message;

          refs.error_msg.setState({
            hide: false,
            value: errMsg
          });
          cb(false);
        } else {
          callback && callback(res);
          cb(true);
        }
      });
    },
    onAction: function(filed, status, refs) {
      switch(filed) {
        case 'rules':
          onClickRule(status, refs);
          break;
        case 'protocol':
          onClickProtocol(status, refs);
          break;
        case 'target':
          onClickTarget(status, refs);
          break;
        case 'icmp_type':
          onClickIcmpType(status, refs);
          break;
        default:
          break;
      }
    }
  };

  commonModal(props);
}

module.exports = pop;
