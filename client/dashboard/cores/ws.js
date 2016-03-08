var notification = require('client/uskin/index').Notification;
var msgEvent = require('client/dashboard/cores/msg_event');
var __ = require('i18n/client/lang.json');

function connectWS(opt) {
  var ws = new WebSocket('ws://localhost:8080');
  var interval;
  ws.onopen = function() {
    ws.send(JSON.stringify(opt));
    interval = setInterval(function() {
      ws.send('h');
    }, 25000);
  };
  ws.onmessage = function(event) {
    var data = JSON.parse(event.data);

    notification.addNotice({
      showIcon: true,
      content: __.msg_notify.replace('{0}', __[data.action]).
              replace('{1}', __[data.resource_type]).
              replace('{2}', data.resource_name),
      type: 'success',
      isAutoHide: true,
      id: data.resource_id
    });
    msgEvent.emit('message', data);
  };
  ws.onclose = function() {
    clearInterval(interval);
    setTimeout(function() {
      connectWS(opt);
    }, 1000);

  };
  ws.onerror = function(err) {
    console.log(err);
  };
}

try {
  var opt = {
    userId: HALO.user.userId,
    projectId: HALO.user.projectId
  };

  console.log('load websocket');
  connectWS(opt);
} catch (e) {
  console.log('mock HALO');
}
