module.exports = function (app) {
  app.use(/v1/, function (req, res, next) {
    if (req.session.user) {
      next();
    } else {
      res.redirect('/');
    }
  });
};
