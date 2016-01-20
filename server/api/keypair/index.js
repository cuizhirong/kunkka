var extend = require('extend');
var Nova = require('nova');

function Keypair (app, nova, glance, neutron) {
  this.app = app;
  this.nova = nova;
}

var prototype = {
  getKeypairList: function (req, res, next) {
    var projectId = req.params.projectId;
    var region = req.headers.region;
    var token = req.session.user.token;
    this.nova.listKeypairs(projectId, token, region, function (err, payload) {
      if (err) {
        res.status(err.status).json(err);
      } else {
        res.json(payload.body);
      }
    });
  },
  initRoutes: function () {
    this.app.get('/api/v1/:projectId/keypairs/detail', this.getKeypairList.bind(this));
  }
};

module.exports = function (app, extension) {
  extend(Keypair.prototype, prototype);
  if (extension) {
    extend(Keypair.prototype, extension);
  }
  var instance = new Keypair(app, Nova);
  instance.initRoutes();
};
