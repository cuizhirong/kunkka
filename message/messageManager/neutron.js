function baseFormatter (msg, originMsg, type) {
  switch (msg.action) {
    case 'create':
      if (!originMsg.payload[msg.resource_type].id) {
        msg = null;
      } else {
        msg.resource_id = originMsg.payload[msg.resource_type].id;
        msg.resource_name = originMsg.payload[msg.resource_type].name;
      }
      break;
    case 'delete':
      msg.resource_id = originMsg.payload[msg.resource_type + '_id'];
      break;
    default:
      msg = null;
  }
  return msg;
}


function portFormatter (msg, originMsg) {
  switch (msg.action) {
    case 'create':
      if (!originMsg.payload.port.id) {
        msg = null;
      } else {
        msg.resource_id = originMsg.payload.port.id;
        msg.resource_name = originMsg.payload.port.name;
        if (originMsg.payload.port.device_owner === 'compute:nova') {
          msg.instance_id = originMsg.payload.port.device_id;
        } else {
          msg.device_id = originMsg.payload.port.device_id;
        }
      }
      break;
    case 'delete':
      msg.resource_id = originMsg.payload.port_id;
      break;
    default:
      msg = null;
  }
  return msg;
}

function floatingipFormatter (msg, originMsg) {
  switch (msg.action) {
    case 'create':
      if (!originMsg.payload.floatingip.id) {
        msg = null;
      } else {
        msg.resource_id = originMsg.payload.floatingip.id;
        msg.floatingip_address = originMsg.payload.floatingip.floating_ip_address;
      }
      break;
    case 'delete':
      msg.resource_id = originMsg.payload.floatingip_id;
      break;
    case 'update':
      msg.resource_id = msg.stage === 'start' ? originMsg.payload.id : originMsg.payload.floatingip.id;
      msg.action = originMsg.payload.floatingip.port_id ? 'associate' : 'disassociate';
      msg.floatingip_address = msg.stage === 'end' ? originMsg.payload.floatingip.floating_ip_address : undefined;
      break;
    default:
      msg = null;
  }
  return msg;
}

function routerFormatter (msg, originMsg) {
  if (originMsg.event_type === 'router.update.start') {
    msg.resource_id = originMsg.payload.id;
    if (originMsg.payload.router.external_gateway_info && Object.keys(originMsg.payload.router.external_gateway_info).length > 0) {
      msg.action = 'set_gateway';
    } else {
      msg.action = 'clear_gateway';
    }
  } else if (originMsg.event_type === 'router.update.end') {
    msg.resource_id = originMsg.payload.router.id;
    if (originMsg.payload.router.external_gateway_info && Object.keys(originMsg.payload.router.external_gateway_info).length > 0) {
      msg.action = 'set_gateway';
    } else {
      msg.action = 'clear_gateway';
    }
  } else if (msg.action === 'interface') {
    msg.resource_id = originMsg.payload.router_interface.id;
    msg.subnet_id = originMsg.payload.router_interface.subnet_id;
    msg.port_id = originMsg.payload.router_interface.port_id;
    msg.network_id = originMsg.payload.router_interface.network_id;
    msg.action = msg.stage === 'delete' ? 'delete_interface' : 'add_interface';
    msg.stage = 'end';
  } else if (msg.action === 'create' || msg.action === 'delete') {
    msg = baseFormatter(msg, originMsg);
  } else {
    msg = null;
  }
  return msg;
}

exports.formatter = function (originMsg, eventTypeArray) {
  var message = {};
  message.resource_type = eventTypeArray[0];
  message.action = eventTypeArray[1];
  message.stage = eventTypeArray[2];
  switch (message.resource_type) {
    case 'network':
      message = baseFormatter(message, originMsg);
      break;
    case 'subnet':
      message = baseFormatter(message, originMsg);
      break;
    case 'router':
      message = routerFormatter(message, originMsg);
      break;
    case 'port':
      message = portFormatter(message, originMsg);
      break;
    case 'floatingip':
      message = floatingipFormatter(message, originMsg);
      break;
    default:
      message = null;
  }
  return message;
};
