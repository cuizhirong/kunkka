var config = require('../../server/config')('mq');
var uuid = require('node-uuid');
var amqp = require('amqplib');

function RabbitMqListener (consumer, servers, timeout) {
  this.consumer = consumer;
  this.mqServers = servers;
  this.currentServer = servers[0];
  this.reconnectTimeout = timeout;
}


RabbitMqListener.prototype.connect = function (connectTarget) {
  var queueId;
  var that = this;
  if (connectTarget) {
    this.currentServer = connectTarget;
  }
  var url = 'amqp://' + config.username + ':' + config.password + '@' + this.currentServer + ':' + config.port + '/?heartbeat=' + config.heartbeat;
  amqp.connect(url).then(function(conn) {
    that.reconnectTimeout = 1000;
    process.once('SIGINT', function() {
      conn.close();
    });
    conn.on('error', function (err) {
      console.warn(err);
    });
    conn.on('close', function() {
      that.reconnect(that.currentServer);
    });
    conn.createChannel().then(function(ch) {
      // ch.on('close', that.reconnect.bind(that));
      // ch.on('error', function (err) {
      //   console.log('+++++in err');
      //   console.log(err);
      // })
      var ok = ch.assertExchange('halo', 'fanout', {
        alternateExchange: 'notifications.*'
      });
      ok.then(function() {
        var _promiseArray = [];
        config.sourceExchanges.forEach(function (s) {
          _promiseArray.push(ch.bindExchange('halo', s, 'notifications.*'));
        });
        return Promise.all(_promiseArray);
      });
      ok = ok.then(function() {
        queueId = 'halo_' + uuid();
        return ch.assertQueue(queueId, {
          durable: false,
          autoDelete: true
        });
      });
      ok = ok.then(function(qok) {
        return ch.bindQueue(qok.queue, 'halo').then(function() {
          return qok.queue;
        });
      });
      ok = ok.then(function (queue) {
        return ch.consume(queue, that.consumer, {
          noAck: true
        });
      });
      return ok.then(function() {
        console.log('connection to rabbitmq ' + that.currentServer + ' is established successfully');
      });
    });
  }, function (err) {
    console.warn(err);
    var nextTarget = that.getAvailableServer(that.currentServer);
    that.reconnect(nextTarget);
  }).then(null, console.warn);
};

RabbitMqListener.prototype.reconnect = function (connectTarget) {
  var that = this;
  this.reconnectTimeout = this.reconnectTimeout < config.maxTimeoutLimit ? (this.reconnectTimeout + 1000) : config.maxTimeoutLimit;
  console.log(this.reconnectTimeout);
  setTimeout(function () {
    that.connect(connectTarget);
  }, that.reconnectTimeout);
};

RabbitMqListener.prototype.getAvailableServer = function (failServer) {
  var availableServers = this.mqServers.filter(function (el) {
    return el !== failServer;
  });
  var randomIndex = Math.floor(Math.random() * availableServers.length);
  return availableServers[randomIndex];
};

module.exports = RabbitMqListener;
