'use strict';

const models = require('../models');
const Application = models.application;
const Approval = models.approval;

exports.create = function (data) {
  return Application.create(data, {
    include: [Approval]
  });
};

exports.findOneById = function (id) {
  return Application.findOne({
    where: {
      id: id
    },
    include: [{all: true}]
  });
};

exports.findOneByIdAndOwner = function (id, userId) {
  return Application.findAll({
    where: {
      id: id,
      userId: userId
    }
  });
};

exports.findAllByFields = function (fields) {
  let obj = {where: {}};
  if (fields.userId) {

    obj.where.userId = fields.userId;
    obj.include = [Approval];

  } else if (fields.approver) {
    if (fields.approver.approved) {
      obj.include = [{
        model: Approval,
        where: {
          userId: fields.approver.userId
        }
      }];
    } else {
      obj.include = [{
        model: Approval,
        where: {
          approverRole: fields.approver.approverRole,
          status: 'approving'
        }
      }];
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

  return Application.findAndCount(obj);
};
