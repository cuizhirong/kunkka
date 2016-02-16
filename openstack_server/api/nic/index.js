var async = require('async');
var Neutron = require('openstack_server/drivers/neutron');
var Nova = require('openstack_server/drivers/nova');
var Base = require('../base');

// due to Nic is reserved word
function Nic (app, neutron, nova) {
  var that = this;
  this.app = app;
  this.neutron = neutron;
  this.nova = nova;
  this.arrAsyncTarget = ['subnets', 'floatingips', 'servers', 'security_groups'];
  this.arrAsync = [
    function (callback) {
      that.neutron.listSubnets(that.token, that.region, that.asyncHandler.bind(this, callback));
    },
    function (callback) {
      that.neutron.listFloatingips(that.token, that.region, that.asyncHandler.bind(this, callback));
    },
    function (callback) {
      that.nova.listServers(that.projectId, that.token, that.region, that.asyncHandler.bind(this, callback));
    },
    function (callback) {
      that.nova.listSecurity(that.projectId, that.token, that.region, that.asyncHandler.bind(this, callback));
    }
  ];
}

var makeNic = function (port, obj) {
  obj.servers.some(function(server, i) {
    if ( server.id === port.device_id) {
      port.instance = server;
      return true;
    } else {
      return false;
    }
  });
  port.floatingip = {};
  obj.floatingips.some(function (floatingip) {
    return port.id === floatingip.port_id && (port.floatingip = floatingip);
  });
  port.security_groups.forEach(function(securityId, index) {
    obj.security_groups.some(function(security, i) {
      if ( security.id === securityId) {
        port.security_groups[index] = security;
        return true;
      } else {
        return false;
      }
    });
  });
  port.subnet = {};
  port.fixed_ips.forEach(function(e, index) {
    obj.subnets.some(function(subnet, i) {
      if ( subnet.id === e.subnet_id) {
        port.subnet = subnet;
        return true;
      } else {
        return false;
      }
    });
  });
};

var prototype = {
  asyncHandler: function (callback, err, payload) {
    if (err) {
      callback(err);
    } else {
      callback(null, payload.body);
    }
  },
  getNicList: function (req, res, next) {
    var that = this;
    this.projectId = req.params.projectId;
    this.region = req.headers.region;
    this.token = req.session.user.token;
    async.parallel([
      function (callback) {
        that.neutron.listPorts(that.token, that.region, that.asyncHandler.bind(this, callback));
      }].concat(that.arrAsync),
      function (err, results) {
        if (err) {
          that.handleError(err, req, res, next);
        } else {
          var obj = {};
          ['ports'].concat(that.arrAsyncTarget).forEach(function(e, index){
            obj[e] = results[index][e];
          });
          obj.nic = [];
          obj.ports.forEach(function(port, index){
            if (port.device_owner === 'compute:nova') {
              obj.nic.push(port);
              makeNic(port, obj);
            }
          });
          res.json({
            nics: obj.nic
          });
        }
      });
  },
  getNicDetails: function (req, res, next) {
    var that = this;
    this.projectId = req.params.projectId;
    this.nicId = req.params.nicId;
    this.token = req.session.user.token;
    this.region = req.headers.region;
    async.parallel([
      function (callback) {
        that.neutron.showPortDetails(that.nicId, that.token, that.region, that.asyncHandler.bind(this, callback));
      }].concat(that.arrAsync),
      function (err, results) {
        if (err) {
          that.handleError(err, req, res, next);
        } else {
          var obj = {};
          ['port'].concat(that.arrAsyncTarget).forEach(function(e, index){
            obj[e] = results[index][e];
          });
          makeNic(obj.port, obj);
          res.json({
            nic: obj.port
          });
        }
      });
  },
  initRoutes: function () {
    this.app.get('/api/v1/:projectId/nic', this.getNicList.bind(this));
    this.app.get('/api/v1/:projectId/nic/:nicId', this.getNicDetails.bind(this));
  }
};

module.exports = function (app, extension) {
  Object.assign(Nic.prototype, Base.prototype);
  Object.assign(Nic.prototype, prototype);
  if (extension) {
    Object.assign(Nic.prototype, extension);
  }
  var security = new Nic(app, Neutron, Nova);
  security.initRoutes();
};
