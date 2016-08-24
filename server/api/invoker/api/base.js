'use strict';
const flow = require('config')('ticket_flow') || ['Member', 'owner', 'admin'];
const flowReverse = JSON.parse(JSON.stringify(flow)).reverse();

function API () {
}

API.prototype = {
  checkOwner: function (req, res, next) {
    if (!req.session.user) {
      return res.status(403).json({error: 'Permission Denied'});
    } else {
      next();
    }
  },

  getRoleIndex: function (arrRoles) {
    if (!Array.isArray(arrRoles) || arrRoles.length === 0) {
      return -1;
    }

    let roleIndex = -1;
    flowReverse.some(function (role, i) {
      return arrRoles.indexOf(role) > -1 && (roleIndex = i);
    });

    return flow.indexOf(flowReverse[roleIndex]);
  }
};

module.exports = API;
