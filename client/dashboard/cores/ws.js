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
    console.log(JSON.parse(event.data));
  };
  ws.onclose = function() {
    clearInterval(interval);
    setTimeout(function() {
      connectWS();
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
