'use strict';

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
  }
};

module.exports = API;
