'use strict';

const models = require('../models');
const reply = models.reply;

exports.create = function (data) {
  return reply.create(data);
};

exports.findOneById = function (id) {
  return reply.findById(id);
};

exports.update = function (id, content) {
  return reply.update({content: content}, {
    where: {
      id: id
    }
  });
};

exports.deleteById = function (id) {
  return reply.destory({
    where: {
      id: id
    }
  });
};
