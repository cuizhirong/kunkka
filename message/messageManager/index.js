var EventEmitter = require('events');
var util = require('util');

var novaMsgHandler = require('./nova');
var cinderMsgHandler = require('./cinder');
var glanceMsgHandler = require('./glance');

function MessageManager () {
  EventEmitter.call(this);
  this.ignoreList = novaMsgHandler.ignoreList.concat(glanceMsgHandler.ignoreList);
}

util.inherits(MessageManager, EventEmitter);

MessageManager.prototype.msgDispatcher = function (ws, msg) {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify(msg));
  }
};

MessageManager.prototype.getListenerName = function (msg) {
  if (msg.event_type === 'image.delete') {
    return msg.payload.properties.user_id + msg.payload.owner;
  } else {
    return msg._context_user_id + msg._context_project_id;
  }
};

MessageManager.prototype.mqMessageListener = function (msg) {
  var msgContent = JSON.parse(msg.content.toString());
  if (this.isIgnoredMsg(msgContent)) {
    return;
  }
  var listener = this.getListenerName(msgContent);
  var formattedMsg = this.msgFormatter(msgContent);
  if (formattedMsg) {
    this.emit(listener, formattedMsg);
  }
};

MessageManager.prototype.msgFormatter = function (msg) {
  var ret;
  var eventTypeArray = msg.event_type.split('.');
  var type = eventTypeArray[0];
  switch (type) {
    case 'compute':
      ret = novaMsgHandler.formatter(msg, eventTypeArray);
      break;
    case 'snapshot':
    case 'volume':
      ret = cinderMsgHandler.formatter(msg, eventTypeArray);
      break;
    case 'image':
      ret = glanceMsgHandler.formatter(msg, eventTypeArray);
      break;
    default:
      ret = null;
  }
  return ret;
};

MessageManager.prototype.isIgnoredMsg = function (msg) {
  if (this.ignoreList.indexOf(msg.event_type) > -1) {
    return true;
  } else {
    return false;
  }
};

module.exports = MessageManager;
