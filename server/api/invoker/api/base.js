'use strict';
const config = require('config')('invoker_approver');

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

  //arrRoles: roles that a user has.
  getCurrentRole: function (arrRoles) {
    if (!Array.isArray(arrRoles) || arrRoles.length === 0) {
      return false;
    }
    //list of all of the roles
    let roleList = Object.keys(config).reverse();
    let roleIndex = -1;
    let tmpIndex = -1;

    roleList.some(function (role, i) {
      tmpIndex = arrRoles.indexOf(role);
      roleIndex = i;
      return tmpIndex > -1;
    });

    if (roleIndex < 0) {
      return false;
    }
    return roleList[roleIndex];
  }
};

module.exports = API;
