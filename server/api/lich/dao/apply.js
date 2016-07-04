'use strict';

const models = require('../models');
const Apply = models.apply;
const Approve = models.approve;

exports.create = function (data) {
  return Apply.create(data, {
    include: [Approve]
  });
};

exports.findOneById = function (id) {
  return Apply.findOne({
    where: {
      id: id
    },
    include: [{all: true}]
  });
};

exports.findOneByIdAndOwner = function (id, owner) {
  return Apply.findAll({
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
  } else {
    if (fields.approver) {
      obj.include = [{
        model: Approve,
        where: {
          approver: fields.approver,
          status: {$in: ['approving', 'done']}
        }
      }];
    } else {
      obj.include = [{model: Approve}];
    }
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


  return Apply.findAndCount(obj);
};
