var config = require('../server/config');

var websocketConfig = config('websocket');
var mqConfig = config('mq');

var MessageManager = require('./messageManager');
var msgManager = new MessageManager();

// establish a connection to rabbimq, listen to the messages
var MQ = require('./mq');
var mq = new MQ(msgManager.mqMessageListener.bind(msgManager), mqConfig.remotes, mqConfig.reconnectTimeout);
mq.connect();

// boot a websocket server
var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({ port: websocketConfig.port });
wss.on('connection', function connection(ws) {
  var listener;
  var _msgDispatcher = msgManager.msgDispatcher.bind(undefined, ws);
  ws.on('message', function incoming(message) {
    if (message && message !== 'h') {
      listener = message;
      msgManager.addListener(listener, _msgDispatcher);
    } else if (message !== 'h') {
      ws.close();
    }
  });
  ws.onclose = function() {
    msgManager.removeListener(listener, _msgDispatcher);
  };
  ws.onerror = function (err) {
    console.log(err);
  };
});
