var request = require('client/dashboard/cores/request');
var events = require('client/dashboard/cores/events');
var store = require('./store');


// actionType: getItems, getItem, postItem, putItem, deleteItem
// dataType: instance, volume, image

const dataType = 'instance';

events.on(dataType, function(actionType, data) {
  switch (actionType) {
    case 'getItems':
      request.get({
        url: '/api/v1/' + HALO.user.projectId + '/servers/detail'
      }).then(function(res) {
        store.emit(dataType, actionType, res.servers);
      }, function() {
        store.emit(dataType, actionType, []);
      });
      break;
    default:
      break;
  }
});

module.exports = events;
