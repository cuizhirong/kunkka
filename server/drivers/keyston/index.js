'use strict';

var request = require('superagent');

var Keyston = {
    login: function(username, password, callback) {
        request
            .post(global.config.remote.keyston + '/v3/auth/tokens')
            .send({
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
            })
            .end(function(err, res) {
                callback(err, res);
            });
    },
    logout: function(token, callback) {
        var request = new Requst('DELETE', global.config.remote.keyston + '/v3/auth/tokens');
        request.setHeader('X-Subject-Token', token).exec(null, function(error, body, response) {
            callback(error, body, response);
        });
        request.exec(null, function(error, body, response) {
            callback(error, body, response);
        });
    },
    getProjects: function(token, callback) {
        var request = new Requst('GET', global.config.remote.keyston + '/v3/projects');
        request.setHeader('X-Subject-Token', token);

        request.exec(null, function(error, body, response) {
            console.log(error, body);
            callback(error, body, response);
        });
    }
}

module.exports = Keyston;