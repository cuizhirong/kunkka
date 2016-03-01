exports.formatter = function (msg, eventTypeArray) {
  var message = {};
  message.resource_type = 'image';
  message.action = eventTypeArray[1];
  message.stage = 'end';
  message.resource_id = msg.payload.id;
  message.user_id = msg.payload.owner;
  message.resource_name = msg.payload.name;
  return message;
};

exports.ignoreList = [
  'image.update',
  'image.activate',
  'image.upload',
  'image.create',
  'image.prepare'
];
