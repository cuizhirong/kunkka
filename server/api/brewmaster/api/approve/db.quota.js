'use strict';

const models = require('../../models');
const Quota = models.quota_approve;
const Promise = require('bluebird');

exports.findAllByFields = function (fields) {
  let obj = {where: {}, include: [{ model:models.user}]};
  if (fields.limit) {
    obj.limit = fields.limit;
  }
  if (fields.page) {
    obj.offset = (fields.page - 1) * fields.limit;
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
  let countObj = {};

  for (let key in obj) {
    if (key !== 'order') {
      countObj[key] = obj[key];
    }
  }

  return Promise.props({
    rows:Quota.findAll(obj),
    count: Quota.count(countObj)
  });
};
