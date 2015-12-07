/**
 * Internal dependencies
 */

var multer = require('multer');
var upload = multer(); // for parsing multipart/form-data
var Keystone = require('keystone');
var async = require('async');

module.exports = function(app) {

    app.post('/auth/login', upload.array(), function(req, res) {

        async.waterfall([
            function(cb) {
                Keystone.login(req.body.username, req.body.password, function(error, response) {
                    if (error) {
                        res.status(error.responseInfo.status).send(error.responseInfo.body);
                    } else {
                        var header = response.headers;
                        var body = response.body;
                        req.session.token = header['x-subject-token'];
                        if (body.token && body.token['expires_at']) {
                            req.session['expires_at'] = body.token['expires_at'];
                        }

                        if (body.token && body.token['expires_at']) {
                            cb(null, header['x-subject-token'], body.token['expires_at']);
                        } else {
                            cb(null, header['x-subject-token']);
                        }
                    }
                });
            },
            function(token, cb) {
                Keystone.getAuthURL(token, function(error, response) {

                });
            },
            function(token, cb) {
                Keystone.getProjects(token, function(error, response) {
                    if (error) {
                        res.status(error.status).send(error.response.body);
                        return;
                    }
                    req.session.save(function(err) {
                        if (!err) {
                            res.status(201).send('Accepted');
                        }
                    });
                });
            }
        ]);
    });

    app.get('/auth/login', function(req, res) {
        res.json({
            version: "test"
        });
    });
};