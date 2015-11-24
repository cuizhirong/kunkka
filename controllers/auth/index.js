'use strict';

var express = require('express');
var router = express.Router();
var multer = require('multer'); // v1.0.5

var upload = multer(); // for parsing multipart/form-data

var Keyston = require('../../drivers/keyston');


router.post('/login', upload.array(), function(req, res, next) {

    var async = require('async');

    async.waterfall([
        function(cb) {
            Keyston.login(req.body.username, req.body.password, function(error, body, response) {
                if (error) {
                    res.status(error.responseInfo.status).send(error.responseInfo.body);
                } else {
                    var header = response.headers;

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
            Keyston.getProjects(token, function(error, body, response) {

                req.session.save(function(err) {
                    if (!err) {
                        res.status(201).send('Accepted');
                    }
                });
            });
        }
    ]);

});

router.delete('/logout', function(req, res, next) {
    Keyston.logout(req.headers['x-subject-token'], function(error, body, response) {
        if (error) {
            res.status(error.responseInfo.status).send(error.responseInfo.body);
        } else {
            res.status(201);
        }
    });
});

module.exports = router;