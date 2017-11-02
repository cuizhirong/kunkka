'use strict';

const email = require('./email');
const sms = require('./sms');

const driver = {email, sms};

module.exports = driver;
