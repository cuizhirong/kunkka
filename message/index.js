var config = require('../server/config')('websocket');

var MessageManager = require('./messageManager');
var msgManager = new MessageManager();

// establish a connection to rabbimq, listen to the messages
var MQ = require('./mq');
var mq = new MQ(msgManager.mqMessageListener.bind(msgManager));
mq.connect();

// boot a websocket server
var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({ port: config.port });
wss.on('connection', function connection(ws) {
  var userId, projectId;
  var _msgDispatcher = msgManager.msgDispatcher.bind(undefined, ws);
  ws.on('message', function incoming(message) {
    if (message !== 'h') {
      message = JSON.parse(message);
      userId = message.userId;
      projectId = message.projectId;
      msgManager.addListener(userId + projectId, _msgDispatcher);
    }
  });
  ws.onclose = function() {
    msgManager.removeListener(userId + projectId, _msgDispatcher);
  };
  ws.onerror = function (err) {
    console.log(err);
  };
});
