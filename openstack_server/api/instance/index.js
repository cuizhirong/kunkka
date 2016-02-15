var async = require('async');
var Glance = require('openstack_server/drivers/glance');
var Cinder = require('openstack_server/drivers/cinder');
var Nova = require('openstack_server/drivers/nova');
var Neutron = require('openstack_server/drivers/neutron');

function Instance(app, nova, glance, cinder, neutron) {
  var that = this;
  this.app = app;
  this.nova = nova;
  this.glance = glance;
  this.cinder = cinder;
  this.neutron = neutron;
  this.arrAsyncTarget = ['images', 'floatingips', 'subnets', 'ports', 'flavors', 'volumes', 'keypairs', 'security_groups'];
  that.arrAsync = [
    function (callback) {
      that.glance.listImages(that.token, that.region, that.asyncHandler.bind(this, callback));
    },
    function (callback) {
      that.neutron.listFloatingips(that.token, that.region, that.asyncHandler.bind(this, callback));
    },
    function (callback) {
      that.neutron.listSubnets(that.token, that.region, that.asyncHandler.bind(this, callback));
    },
    function (callback) {
      that.neutron.listPorts(that.token, that.region, that.asyncHandler.bind(this, callback));
    },
    function (callback) {
      that.nova.listFlavors(that.projectId, that.token, that.region, that.asyncHandler.bind(this, callback));
    },
    function (callback) {
      that.cinder.listVolumes(that.projectId, that.token, that.region, that.asyncHandler.bind(this, callback));
    },
    function (callback) {
      that.nova.listKeypairs(that.projectId, that.token, that.region, that.asyncHandler.bind(this, callback));
    },
    function (callback) {
      that.nova.listSecurity(that.projectId, that.token, that.region, that.asyncHandler.bind(this, callback));
    }
  ];
}

var makeNetwork = function (server, obj) { /* floatingips, ports, subnets */
  var addresses = server.addresses;
  var _floatingip;
  var _fixedIps = [];
  var ipv6 = [];
  Object.keys(addresses).forEach(function (el) {
    ipv6 = [];
    addresses[el].forEach(function (e, index) {
      e.security_groups = [];
      if (e.version === 6) {
        ipv6.push(index);
      } else { // ipv4
        if (e['OS-EXT-IPS:type'] === 'fixed') {
          _fixedIps.push(e.addr);
          if (obj.ports) {
            obj.ports.some(function(p){
              if (p.device_id === server.id && p.fixed_ips[0].ip_address === e.addr) {
                e.port = p;
                obj.subnets.some(function(sub){
                  if (sub.id === p.fixed_ips[0].subnet_id) {
                    e.subnet = sub;
                  }
                });
                p.security_groups.forEach(function(security){
                  obj.security_groups.some(function(scu){
                    if (scu.id === security) {
                      e.security_groups.push(scu);
                    }
                  });
                });
              }
            });
          }
        } else { // floating
          obj.floatingips.some(function (floatingip) {
            return e.addr === floatingip.floating_ip_address && (e.floatingip = floatingip) && (_floatingip = floatingip);
          });
        }
      }
    });
    ipv6.forEach(function(i){
      addresses[el].splice(i, 1);
    });
  });
  server.fixed_ips = _fixedIps;
  server.floating_ip = _floatingip;
};

var makeServer = function (server, obj) {
  server.volume = [];
  server.instance_snapshot = [];
  delete server.links;
  obj.flavors.some(function (flavor) {
    return flavor.id === server.flavor.id && (delete flavor.links) && (server.flavor = flavor);
  });
  obj.images.forEach(function (image) {
    if (image.id === server.image.id) {
      delete image.links;
      server.image = image;
    } else if (image.image_type && image.image_type === 'snapshot' && image.instance_uuid === server.id) {
      server.instance_snapshot.push(image);
    } else {
      return true;
    }
  });
  server['os-extended-volumes:volumes_attached'].forEach(function (e) {
    obj.volumes.some(function (ele) {
      return e.id === ele.id && delete ele.links && server.volume.push(ele);
    });
  });
  obj.keypairs.some(function (e) {
    return e.keypair.name === server.key_name && (server.keypair = e.keypair);
  });
  makeNetwork(server, obj);
};

var prototype = {
  asyncHandler: function (callback, err, payload) {
    if (err) {
      callback(err);
    } else {
      callback(null, payload.body);
    }
  },
  getInstanceList: function (req, res, next) {
    var that = this;
    this.projectId = req.params.id;
    this.region = req.headers.region;
    this.token = req.session.user.token;
    async.parallel([
      function (callback) {
        that.nova.listServers(that.projectId, that.token, that.region, that.asyncHandler.bind(this, callback));
      }].concat(that.arrAsync),
      function (err, results) {
        if (err) {
          return res.status(err.status).json(err);
        } else {
          var obj = {};
          ['servers'].concat(that.arrAsyncTarget).forEach(function(e, index){
            obj[e] = results[index][e];
          });
          obj.servers.forEach(function (server) {
            makeServer(server, obj);
          });
          res.json({
            servers: obj.servers
          });
        }
      });
  },
  getInstanceDetails: function (req, res, next) {
    var that = this;
    this.projectId = req.params.project;
    this.serverId = req.params.server;
    this.region = req.headers.region;
    this.token = req.session.user.token;
    async.parallel([
      function (callback) {
        that.nova.showServerDetails(that.projectId, that.serverId, that.token, that.region, that.asyncHandler.bind(this, callback));
      }].concat(that.arrAsync),
      function (err, results) {
        if (err) {
          return res.status(err.status).json(err);
        } else {
          var obj = {};
          ['server'].concat(that.arrAsyncTarget).forEach(function(e, index){
            obj[e] = results[index][e];
          });
          makeServer(obj.server, obj);
          res.json({
            server: obj.server
          });
        }
      });
  },
  getVNCConsole: function (req, res, next) {
    var projectId = req.params.project;
    var serverId = req.params.server;
    var region = req.headers.region;
    var token = req.session.user.token;
    this.nova.getVNCConsole(projectId, serverId, token, region, function (err, payload) {
      if (err) {
        return res.status(err.status).json(err);
      } else {
        res.json(payload.body);
      }
    });
  },
  getConsoleOutput: function (req, res, next) {
    var projectId = req.params.project;
    var serverId = req.params.server;
    var region = req.headers.region;
    var token = req.session.user.token;
    this.nova.getConsoleOutput(projectId, serverId, token, region, function (err, payload) {
      if (err) {
        return res.status(err.status).json(err);
      } else {
        res.json(payload.body);
      }
    });
  },
  initRoutes: function () {
    this.app.get('/api/v1/:id/servers/detail', this.getInstanceList.bind(this));
    this.app.get('/api/v1/:project/servers/:server', this.getInstanceDetails.bind(this));
    this.app.post('/api/v1/:project/servers/:server/action/vnc', this.getVNCConsole.bind(this));
    this.app.post('/api/v1/:project/servers/:server/action/output', this.getConsoleOutput.bind(this));
  }
};

module.exports = function (app, extension) {
  Object.assign(Instance.prototype, prototype);
  if (extension) {
    Object.assign(Instance.prototype, extension);
  }
  var instance = new Instance(app, Nova, Glance, Cinder, Neutron);
  instance.initRoutes();
};
