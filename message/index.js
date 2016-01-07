var config = require('../server/config')('websocket');
var EventEmitter = require('events');
var emitter = new EventEmitter();

// dispatch the message to client through websocket
function messageDispatcher (ws, msg) {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify(msg));
  }
}

function mqMessageListener (msg) {
  var message = JSON.parse(msg.content.toString());
  var userId = message._context_user_id;
  emitter.emit(userId, message);
}

// establish a connection to rabbimq, listen to the messages
var mq = require('./mq');
mq(mqMessageListener);

// boot a websocket server
var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({ port: config.port });
wss.on('connection', function connection(ws) {
  var userId;
  var _msgDispatcher = messageDispatcher.bind(undefined, ws);
  ws.on('message', function incoming(message) {
    if (message !== 'h') {
      message = JSON.parse(message);
      userId = message.userId;
      emitter.addListener(userId, _msgDispatcher);
    }
  });
  ws.onclose = function() {
    emitter.removeListener(userId, _msgDispatcher);
  };
  ws.onerror = function (err) {
    console.log(err);
  };
});
