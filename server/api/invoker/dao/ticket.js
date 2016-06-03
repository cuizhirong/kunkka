'use strict';

const models = require('../models');
const Ticket = models.ticket;
const Attachment = models.attachment;

exports.create = function (data) {
  return Ticket.create(data, {
    include: [ Attachment ]
  });
};

exports.findOneById = function (id) {
  return Ticket.findOne({
    where: {
      id: id
    },
    include: [{all: true}]
  });
};

exports.findOneByIdAndOwner = function (id, owner) {
  return Ticket.findAll({
    where: {
      id: id,
      owner: owner
    }
  });
};

exports.findAllByFields = function (fields) {
  let obj = {};
  if (fields.owner) {
    obj.where = {
      owner: fields.owner
    };
  }
  if (fields.limit) {
    obj.limit = fields.limit;
  }
  if (fields.page) {
    obj.offset = (fields.page - 1) * fields.limit;
  }
  obj.order = [
    ['status', 'DESC'],
    ['updatedAt', 'DESC']
  ];
  return Ticket.findAndCount(obj);
};
