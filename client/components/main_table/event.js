var EventEmitter = require('eventemitter2');

if (EventEmitter.EventEmitter2) {
  EventEmitter = EventEmitter.EventEmitter2;
}

var event = new EventEmitter({
  wildcard: true
});

module.exports = event;
