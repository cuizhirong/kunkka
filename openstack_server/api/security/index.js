//var async = require('async');
var Nova = require('openstack_server/drivers/nova');

// due to Security is reserved word
function Security (app, nova) {
  this.app = app;
  this.nova = nova;
}

var prototype = {
  getSecurityList: function (req, res, next) {
    var projectId = req.params.id;
    var region = req.headers.region;
    var token = req.session.user.token;
    this.nova.listSecurity(projectId, token, region, function (err, payload) {
      if (err) {
        res.status(err.status).json(err);
      } else {
        res.json(payload.body);
      }
    });
  },
  getSecurityDetails: function (req, res, next) {
    var projectId = req.params.project;
    var securityId = req.params.security;
    var token = req.session.user.token;
    var region = req.headers.region;
    this.nova.showSecurityDetails(projectId, securityId, token, region, function (err, payload) {
      if (err) {
        res.status(err.status).json(err);
      } else {
        res.json(payload.body);
      }
    });
  },
  initRoutes: function () {
    this.app.get('/api/v1/:id/security', this.getSecurityList.bind(this));
    this.app.get('/api/v1/:project/security/:security', this.getSecurityDetails.bind(this));
  }
};

module.exports = function (app, extension) {
  Object.assign(Security.prototype, prototype);
  if (extension) {
    Object.assign(Security.prototype, extension);
  }
  var security = new Security(app, Nova);
  security.initRoutes();
};
