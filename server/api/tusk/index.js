'use strict';

module.exports = function(app) {
  app.use('/api/setting', function (req, res, next) {
    if (req.session.user) {
      next();
    } else {
      return res.status(401).json({error: req.i18n.__('api.auth.unauthorized')});
    }
  });
  // set cache client.
  require('./dao').cacheClient = app.get('CacheClient');
  // use http api.
  require('./api')(app);

  return app;
};
