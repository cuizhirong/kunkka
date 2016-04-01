function getActionAndStage (msg, eventTypeArray) {
  if (eventTypeArray[3] === 'prep' || eventTypeArray[3] === 'confirm') {
    msg.action = eventTypeArray[2] + '_' + eventTypeArray[3];
    msg.stage = eventTypeArray[4];
  } else {
    msg.action = eventTypeArray[2];
    msg.stage = eventTypeArray[3];
  }
}

exports.formatter = function (msg, eventTypeArray) {
  var message = {};
  if (eventTypeArray[2] === 'snapshot') {
    message.resource_type = 'image';
    message.action = 'create';
    message.stage = eventTypeArray[3];
  } else {
    message.resource_type = 'instance';
    getActionAndStage(message, eventTypeArray);
  }
  message.resource_id = msg.payload.instance_id;
  message.user_id = msg._context_user_id;
  message.resource_name = msg.payload.display_name;
  return message;
};

exports.ignoreList = [
  'compute.instance.update',
  'compute.instance.exists',
  'scheduler.select_destinations.start',
  'scheduler.select_destinations.end'
];
