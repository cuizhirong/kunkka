var EventEmitter = require('eventemitter2');

if (EventEmitter.EventEmitter2) {
  EventEmitter = EventEmitter.EventEmitter2;
}

module.exports = new EventEmitter({
  wildcard: true
});
