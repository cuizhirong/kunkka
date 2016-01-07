var config = require('../../server/config')('mq');
var uuid = require('node-uuid');

module.exports = function(callback) {
  var amqp = require('amqplib');
  amqp.connect(config.remote).then(function(conn) {
    process.once('SIGINT', function() {
      conn.close();
    });
    conn.createChannel().then(function(ch) {
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
        return ch.assertQueue('halo_' + uuid(), {
          durable: false
        });
      });
      ok = ok.then(function(qok) {
        return ch.bindQueue(qok.queue, 'halo').then(function() {
          return qok.queue;
        });
      });
      ok = ok.then(function(queue) {
        return ch.consume(queue, callback, {
          noAck: true
        });
      });
      return ok.then(function() {
        console.log('connection to rabbitmq is established successfully');
      });
    });
  }).then(null, console.warn);
};
