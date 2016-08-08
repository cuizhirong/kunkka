'use strict';

const models = require('../models');
const Ticket = models.ticket;
const Attachment = models.attachment;
const Reply = models.reply;

exports.create = function (data) {
  return Ticket.create(data, {
    include: [Attachment]
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
  return Ticket.findOne({
    where: {
      id: id,
      owner: owner
    }
  });
};

exports.findAllByFields = function (fields) {
  let obj = {where: {}, include: [Attachment, Reply]};

  if (fields.owner) {
    obj.where.owner = fields.owner;
  } else {
    if (fields.handlerRole) {
      obj.where.handlerRole = fields.handlerRole
    }

    if (fields.processor) {
      obj.$or = [
        {status: 'proceeding', processor: fields.processor},
        {status: {$ne: 'proceeding'}}
      ];
    }
  }
  if (fields.limit) {
    obj.limit = fields.limit;
  }
  if (fields.page) {
    obj.offset = (fields.page - 1) * fields.limit;
  }

  if (fields.start || fields.end) {
    obj.where.createdAt = {};
    if (fields.start) {
      obj.where.createdAt.$gt = new Date(fields.start);
    }
    if (fields.end) {
      obj.where.createdAt.$lt = new Date(fields.end);
    }
  }

  if (fields.status && Array.isArray(fields.status)) {
    obj.where.status = {
      $in: fields.status
    };
  }
  obj.order = [
    ['status', 'DESC'],
    ['updatedAt', 'DESC']
  ];

  return Ticket.findAndCount(obj);
};
