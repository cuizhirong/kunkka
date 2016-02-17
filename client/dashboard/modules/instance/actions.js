var EventEmitter = require('eventemitter2');

if (EventEmitter.EventEmitter2) {
  EventEmitter = EventEmitter.EventEmitter2;
}

var actions = new EventEmitter({
  wildcard: true
});

var store = require('./stores');

// actionType: getItems, getItem, postItem, putItem, deleteItem
// dataType: instance, volume, image

const dataType = 'instance';

actions.on(dataType, function(actionType, data) {
  switch (actionType) {
    case 'getItems':
      store.emit(dataType, actionType);
      break;
    default:
      break;
  }
});

module.exports = actions;
