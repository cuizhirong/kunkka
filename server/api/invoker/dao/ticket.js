'use strict';

const models = require('../models');
const Ticket = models.ticket;
const Attachment = models.attachment;
const Approver = models.approver;

exports.create = function (data) {
  return Ticket.create(data, {
    include: [Attachment, Approver]
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

  if (fields.start || fields.end) {
    obj.createdAt = {
      $gt: fields.start && new Date(fields.start),
      $lt: fields.end && new Date(fields.end)
    };
  }
  if (fields.status && Array.isArray(fields.status)) {
    obj.status = {
      $in: fields.status
    };
  }
  obj.order = [
    ['status', 'DESC'],
    ['updatedAt', 'DESC']
  ];
  if (fields.approver) {
    obj.include = [{model: Approver, where: {approver: {$in: fields.approver}}}];
  } else {
    obj.include = [{model: Approver}];
  }

  return Ticket.findAndCount(obj);
};
