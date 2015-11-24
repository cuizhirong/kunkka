'use strict';

var express = require('express');
var router = express.Router();
var multer = require('multer'); // v1.0.5

var upload = multer(); // for parsing multipart/form-data

var Nova = require('../../drivers/nova');


router.get('/', upload.array(), function(req, res, next) {

});

module.exports = router;