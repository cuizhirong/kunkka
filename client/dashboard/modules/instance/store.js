var store = require('client/dashboard/cores/store');
var view = require('client/dashboard/cores/view');
var storage = require('client/dashboard/cores/storage');

const dataType = 'instance';

store.on(dataType, function(actionType, data) {
  storage.set('instance', data);
  view.emit(dataType, actionType, data);
});

module.exports = store;
