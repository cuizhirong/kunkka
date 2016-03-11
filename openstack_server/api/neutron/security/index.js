var Neutron = require('openstack_server/drivers').neutron;
var Base = require('openstack_server/api/base.js');

// due to Security is reserved word
function Security (app, neutron) {
  this.app = app;
  this.neutron = neutron;
}

var prototype = {
  getSecurityList: function (req, res, next) {
    var projectId = req.params.projectId;
    var region = req.headers.region;
    var token = req.session.user.token;
    var that = this;
    this.neutron.security.listSecurity(projectId, token, region, function (err, payload) {
      if (err) {
        res.status(err.status).json(err);
      } else {
        that.orderByCreatedTime(payload.body.security_groups);
        res.json(payload.body);
      }
    }, req.query);
  },
  getSecurityDetails: function (req, res, next) {
    var projectId = req.params.projectId;
    var securityId = req.params.securityId;
    var token = req.session.user.token;
    var region = req.headers.region;
    this.neutron.security.showSecurityDetails(projectId, securityId, token, region, function (err, payload) {
      if (err) {
        res.status(err.status).json(err);
      } else {
        res.json(payload.body);
      }
    });
  },
  initRoutes: function () {
    this.app.get('/api/v1/:projectId/security', this.getSecurityList.bind(this));
    this.app.get('/api/v1/:projectId/security/:securityId', this.getSecurityDetails.bind(this));
    this.operate = this.originalOperate.bind(this, this.neutron.security);
    this.generateActionApi(this.neutron.security.metadata);
  }
};

module.exports = function (app, extension) {
  Object.assign(Security.prototype, Base.prototype);
  Object.assign(Security.prototype, prototype);
  if (extension) {
    Object.assign(Security.prototype, extension);
  }
  var security = new Security(app, Neutron);
  security.initRoutes();
};