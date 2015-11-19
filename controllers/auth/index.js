'use strict';

var express = require('express');
var router = express.Router();
var multer = require('multer'); // v1.0.5

var upload = multer(); // for parsing multipart/form-data

var Keyston = require('../../drivers/keyston');


router.post('/login', upload.array(), function(req, res, next) {
    Keyston.login(req.body.username, req.body.password, function(error, body, response) {
        if (error) {
            res.status(error.responseInfo.status).send(error.responseInfo.body);
        } else {
            if (body.token && body.token['expires_at']) {
                res.set('expires_at', Date.parse(body.token['expires_at']));
            }
            res.set('x-subject-token', response.headers['x-subject-token']);
            res.status(200).send(body);
        }
    });
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