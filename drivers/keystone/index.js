'use strict';

var request = require('superagent');
var config = require('config')('remote');


var Keystone = {
    /*
    * Password authentication with unscoped authorization
    * /v3/auth/tokens
    */
    unscopedAuth: function (username, password, callback) {
        request
            .post(config.keystone + '/v3/auth/tokens')
            .send({
                "auth": {
                    "scope": {
                        "unscoped": {}
                    },
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
            .end(callback);
    },
    scopedAuth: function (project_id, token, callback) {
        request
            .post(config.keystone + '/v3/auth/tokens')
            .set('X-Auth-Token', token)
            .send({
                "auth": {
                    "scope": {
                        "project": {
                            "id": project_id
                        }
                    },
                    "identity": {
                        "token": {
                            "id": token
                      },
                        "methods": [
                            "token"
                        ]
                    }
                  }
            })
            .end(callback);
    },
    getUserProjects: function (user_id, token, callback) {
        request
            .get(config.keystone + '/v3/users/' + user_id + '/projects')
            .set('X-Auth-Token', token)
            .end(callback);
    },
    logout: function(token, callback) {
        var request = new Requst('DELETE', config.keystone + '/v3/auth/tokens');
        request.setHeader('X-Subject-Token', token).exec(null, function(error, body, response) {
            callback(error, body, response);
        });
        request.exec(null, function(error, body, response) {
            callback(error, body, response);
        });
    },
    getProjects: function(token, callback) {
        var request = new Requst('GET', config.keystone + '/v3/projects');
        request.setHeader('X-Subject-Token', token);

        request.exec(null, function(error, body, response) {
            console.log(error, body);
            callback(error, body, response);
        });
    }
}

module.exports = Keystone;