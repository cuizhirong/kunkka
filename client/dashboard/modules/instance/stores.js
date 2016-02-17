var request = require('client/dashboard/cores/request');
// var storage = require('client/dashboard/cores/storage');

var EventEmitter = require('eventemitter2');
if (EventEmitter.EventEmitter2) {
  EventEmitter = EventEmitter.EventEmitter2;
}
var stores = new EventEmitter({
  wildcard: true
});


const dataType = 'instance';

stores.on(dataType, function(actionType) {
  // storage.set('instance', data);
  switch (actionType) {
    case 'getItems':
      request.get({
        url: '/api/v1/' + HALO.user.projectId + '/servers/detail'
      }).then((data) => {
        stores.emit('change', actionType, data.servers);
      }, () => {
        stores.emit('change', actionType, []);
      });
      break;
    default:
      break;
  }

});

module.exports = stores;
