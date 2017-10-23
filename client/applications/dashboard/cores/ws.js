const msgEvent = require('./msg_event');
const notify = require('../utils/notify');

function connectWS(opt) {
  let ws = new WebSocket(opt.url);
  let interval;
  ws.onopen = function() {
    ws.send(opt.projectId);
    interval = setInterval(function() {
      ws.send('h');
    }, 25000);
  };
  ws.onmessage = function(event) {
    let data = JSON.parse(event.data);
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
  let opt = {
    projectId: HALO.user.projectId
  };
  let hostname = window.location.hostname;
  let protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
  opt.url = protocol + hostname + HALO.websocket.url;
  console.log('load websocket');
  connectWS(opt);
} catch (e) {
  console.log('mock HALO');
}
