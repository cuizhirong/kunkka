var Nova = require('nova');
//var async = require('async');

function getInstanceList(req, res, next) {
  var projectId = req.params.id;
  Nova.listServer(projectId, req.session.user.token, function(err, payload) {
    if (err) {
      res.status(err.status).json(err);
    }
    res.send(payload.body);
  });
}

module.exports = function(app) {
  app.get('/api/v1/:id/servers/detail', getInstanceList);
};
