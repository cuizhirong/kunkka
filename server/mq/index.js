
module.exports = function(app) {
  // var amqp = require('amqplib');
  // function logMessage(msg) {
  //   console.log(" [x] '%s'", msg.content.toString());
  // }
  // amqp.connect('amqp://stackrabbit:ustack@121.201.53.215:5672').then(function(conn) {
  //   process.once('SIGINT', function() {
  //     conn.close();
  //   });
  //   conn.createChannel().then(function(ch) {
  //     var ok = ch.assertExchange('halo', 'fanout', {
  //       alternateExchange: 'notifications.*'
  //     });
  //     ok = ok.then(function() {
  //       return ch.assertQueue('halo_' + require('node-uuid')(), {
  //         durable: false
  //       });
  //     });
  //     ok = ok.then(function(qok) {
  //       return ch.bindQueue(qok.queue, 'halo').then(function() {
  //         return qok.queue;
  //       });
  //     });
  //     ok = ok.then(function(queue) {
  //       return ch.consume(queue, logMessage, {
  //         noAck: true
  //       });
  //     });
  //     return ok.then(function() {
  //       console.log(' [*] Waiting for logs. To exit press CTRL+C');
  //     });
  //   });
  // }).then(null, console.warn);

  return app;
};
