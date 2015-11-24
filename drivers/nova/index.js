'use strict';

var Requst = require('../base');
var Nova = {
    fetchServers: function(token, callback) {
        var request = new Requst('GET', global.config.remote.nova + '/v3/auth/tokens');
        request.exec(null, function(error, body, response) {
            callback(error, body, response);
        });
    }
}

module.exports = Nova;