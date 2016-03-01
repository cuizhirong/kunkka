exports.formatter = function (msg, eventTypeArray) {
  var message = {};
  message.resource_type = eventTypeArray[0];
  message.action = eventTypeArray[1];
  message.stage = eventTypeArray[2];
  message.resource_id = eventTypeArray[0] === 'volume' ? msg.payload.volume_id : msg.payload.snapshot_id;
  message.user_id = msg._context_user_id;
  message.resource_name = msg.payload.display_name;
  return message;
};
