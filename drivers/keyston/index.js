'use strict';

var Requst = require('../base');
var Keyston = {
    login: function(username, password, callback) {
        var request = new Requst('POST', global.config.keyston + '/v3/auth/tokens');
        request.setRequestData({
            "auth": {
                "identity": {
                    "methods": [
                        "password"
                    ],
                    "password": {
                        "user": {
                            "name": username,
                            "domain": {
                                "id": "default"
                            },
                            "password": password
                        }
                    }
                }
            }
        }).exec(null, function(error, body, response) {
            callback(error, body, response);
        });
    },
    logout: function(token, callback) {
        var request = new Requst('DELETE', global.config.keyston + '/v3/auth/tokens');
        request.setHeader('X-Subject-Token', token).exec(null, function(error, body, response) {
            callback(error, body, response);
        });
        request.exec
    }
}

module.exports = Keyston;