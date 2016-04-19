var msgEvent = require('./msg_event');
var notify = require('../utils/notify');

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
