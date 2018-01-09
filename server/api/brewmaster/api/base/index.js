'use strict';
const basic = require('./basic');
const password = require('./password');
const mem = require('./mem');
const func = require('./func');
const middleware = require('./middleware');

const base = Object.assign({}, basic, {password, mem, func, middleware});

module.exports = base;
