'use strict';
const flow = require('config')('invoker').flow;

function API () {
}

API.prototype = {
  checkOwner: function (req, res, next) {
    let owner = req.params.owner;
    if (!req.session.user.isAdmin && owner !== req.session.user.userId) {
      return res.status(403).json({error: 'Permission Denied'});
    } else {
      next();
    }
  },

  //arrRoles: roles that a user has. eg.['member'],['owner','member']
  //flow:['admin','owner','member']
  getRoleIndex: function (arrRoles) {
    if (!Array.isArray(arrRoles) || arrRoles.length === 0) {
      return false;
    }
    let roleIndex = -1;
    let tmpIndex = -1;

    flow.some(function (role, i) {
      tmpIndex = arrRoles.indexOf(role);
      roleIndex = i;
      return tmpIndex > -1;
    });

    return roleIndex;
  }
};

module.exports = API;
