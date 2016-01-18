module.exports = {
  getInstanceList: function (req, res) {
    var projectId = req.params.id;
    var region = req.headers.region;
    this.Nova.listServer(projectId, req.session.user.token, region, function (err, payload) {
      if (err) {
        return res.status(err.status).json(err);
      }
      res.send(payload.body);
    });
  }
};