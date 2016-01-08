var Cinder = require('cinder');
//var async = require('async');

function getVolumeList(req, res, next) {
  var projectId = req.params.id;
  Cinder.listVolumes(projectId, req.session.user.token, function(err, payload) {
    if (err) {
      res.status(err.status).json(err);
    }
    res.send(payload.body);
  });
}

module.exports = function(app) {
  app.get('/api/v1/:id/volumes/detail', getVolumeList);
};
