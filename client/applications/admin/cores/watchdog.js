// Used to catch unexpected errors

var RSVP = require('rsvp');
var getErrorMessage = require('../utils/error_message');
var notification = require('client/uskin/index').Notification;

RSVP.on('error', function(err) {
  if (err && err.stack) {
    console.assert(false, err.stack);
  } else {
    notification.addNotice({
      showIcon: true,
      content: getErrorMessage(err) || '',
      isAutoHide: true,
      type: 'danger',
      width: 300,
      id: Date.now()
    });
  }
});
