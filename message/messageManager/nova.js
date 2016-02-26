exports.formatter = function (msg, eventTypeArray) {
  var message = {};
  message.action = eventTypeArray[2];
  message.stage = eventTypeArray[3];
  message.resource_id = msg.payload.instance_id;
  message.user_id = msg._context_user_id;
  message.resource_type = 'instance';
  message.resource_name = msg.payload.display_name;
  return message;
};
