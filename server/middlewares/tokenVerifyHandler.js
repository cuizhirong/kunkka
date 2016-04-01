'use strict';

module.exports = function (app) {
  app.use('/api/v1/', function (req, res, next) {
    if (req.session.user) {
      next();
    } else {
      return res.status(401).json({error: req.i18n.__('api.auth.unauthorized')});
    }
  });
};
