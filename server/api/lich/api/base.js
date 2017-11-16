'use strict';


function API () {
}

API.prototype = {
  checkAuth: function (req, res, next) {
    if (req.session.user) {
      next();
    } else {
      return res.status(403).json({error: req.i18n.__('api.lich.limitedAuthority')});
    }
  }
};

module.exports = API;
