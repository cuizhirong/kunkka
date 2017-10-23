'use strict';

const models = require('../models');
const attachment = models.attachment;

exports.create = function (data) {
  return attachment.create(data);
};

exports.findOneById = function (id) {
  return attachment.findById(id);
};

exports.bulkCreate = function (data) {
  return attachment.bulkCreate(data);
};
