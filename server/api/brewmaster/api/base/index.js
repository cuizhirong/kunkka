'use strict';
const basic = require('./basic');
const crypto = require('./crypto');
const mem = require('./mem');
const func = require('./func');
const middleware = require('./middleware');

const base = Object.assign({}, basic, {crypto, mem, func, middleware});

module.exports = base;
