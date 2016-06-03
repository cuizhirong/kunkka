'use strict';

const models = require('../models');
const reply = models.reply;

exports.create = function (data) {
  return reply.create(data);
};

exports.findOneById = function (id) {
  return reply.findById(id);
};
