var notification = require('client/uskin/index').Notification;
var msgEvent = require('client/dashboard/cores/msg_event');
var __ = require('i18n/client/lang.json');

var stack = {};

function notify(data) {
  var isAutoHide = true,
    icon = 'icon-status-active',
    func = notification.addNotice,
    placeholder = 'msg_notify_end',
    name = data.resource_name ? ('"' + data.resource_name + '"') : '';

  if (data.stage === 'start') {
    isAutoHide = false;
    icon = 'loading-notification';
    placeholder = 'msg_notify_start';
    stack[data.resource_id] = true;
  }

  if (stack[data.resource_id] && data.stage === 'end') {
    func = notification.updateNotice;
    delete stack[data.resource_id];
  }

  func({
    showIcon: true,
    content: __[placeholder].replace('{0}', __[data.action]).
    replace('{1}', __[data.resource_type]).
    replace('{2}', name),
    isAutoHide: isAutoHide,
    icon: icon,
    type: 'info',
    id: data.resource_id
  });
  msgEvent.emit('message', data);
}

function connectWS(opt) {
  var ws = new WebSocket(opt.url);
  var interval;
  ws.onopen = function() {
    ws.send(opt.projectId);
    interval = setInterval(function() {
      ws.send('h');
    }, 25000);
  };
  ws.onmessage = function(event) {
    var data = JSON.parse(event.data);
    notify(data);
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
    projectId: HALO.user.projectId
  };
  var hostname = window.location.hostname;
  var protocol = window.location.protocol === 'https' ? 'wss://' : 'ws://';
  opt.url = protocol + hostname + HALO.websocket.url;
  console.log('load websocket');
  connectWS(opt);
} catch (e) {
  console.log('mock HALO');
}
