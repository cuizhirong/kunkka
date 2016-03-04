var Nova = require('openstack_server/drivers').nova;
var Base = require('openstack_server/api/base.js');

function Keypair (app, nova, glance, neutron) {
  this.app = app;
  this.nova = nova;
}

var prototype = {
  getKeypairList: function (req, res, next) {
    var projectId = req.params.projectId;
    var region = req.headers.region;
    var token = req.session.user.token;
    var that = this;
    this.nova.keypair.listKeypairs(projectId, token, region, function (err, payload) {
      if (err) {
        that.handleError(err, req, res, next);
      } else {
        var keypairs = {
          keypairs: []
        };
        payload.body.keypairs.forEach(function (k) {
          keypairs.keypairs.push(k.keypair);
        });
        res.json(keypairs);
      }
    }, req.query);
  },
  initRoutes: function () {
    this.app.get('/api/v1/:projectId/keypairs/detail', this.getKeypairList.bind(this));
    this.operate = this.originalOperate.bind(this, this.nova.keypair);
    this.generateActionApi(this.nova.keypair.metadata, this.operate);
  }
};

module.exports = function (app, extension) {
  Object.assign(Keypair.prototype, Base.prototype);
  Object.assign(Keypair.prototype, prototype);
  if (extension) {
    Object.assign(Keypair.prototype, extension);
  }
  var instance = new Keypair(app, Nova);
  instance.initRoutes();
};
