var config = require('../../server/config')('mq');
var uuid = require('node-uuid');
var amqp = require('amqplib');

function RabbitMqListener (consumer) {
  this.consumer = consumer;
}

RabbitMqListener.prototype.connect = function () {
  var queueId;
  var that = this;
  amqp.connect(config.remote).then(function(conn) {
    process.once('SIGINT', function() {
      conn.close();
    });
    conn.createChannel().then(function(ch) {
      ch.on('close', that.reconnect.bind(that));
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
      ok = ok.then(function(queue) {
        return ch.consume(queue, that.consumer, {
          noAck: true
        });
      });
      return ok.then(function() {
        console.log('connection to rabbitmq is established successfully');
      });
    });
  }).then(null, console.warn);
};

RabbitMqListener.prototype.reconnect = function () {
  var that = this;
  var timeout = config.reconnectTimeout || 1000;
  console.log('======reconnecting');
  setTimeout(function () {
    that.connect();
  }, timeout);
};

module.exports = RabbitMqListener;
