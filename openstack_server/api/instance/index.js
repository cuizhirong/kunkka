var async = require('async');
var Glance = require('openstack_server/drivers/glance');
var Cinder = require('openstack_server/drivers/cinder');
var Nova = require('openstack_server/drivers/nova');
var Neutron = require('openstack_server/drivers/neutron');
var Base = require('../base');

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
              if (p.device_id === server.id && p.mac_address === e['OS-EXT-IPS-MAC:mac_addr']) {
                e.port = p;
                if (p.fixed_ips.length) {
                  obj.subnets.some(function(sub){
                    if (sub.id === p.fixed_ips[0].subnet_id) {
                      e.subnet = sub;
                    }
                  });
                }
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
            return e.addr === floatingip.floating_ip_address && (_floatingip = floatingip);
          });
        }
      }
    });
    ipv6.reverse().forEach(function(i){
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

// default method is post!!!
var apiAction = {
  getVNCConsole    : { type: 'vnc' },
  getConsoleOutput : { type: 'output' },
  start            : { type: 'start' },
  stop             : { type: 'stop' },
  restart          : { type: 'restart' },
  restartHard      : { type: 'hrestart' },
  addFloatingip    : { type: 'addfip' },
  removeFloatingip : { type: 'rmfip' },
  createSnapshot   : { type: 'snapshot' },
  resize           : { type: 'resize' },
  joinNetwork      : { type: 'joinnet' },
  addSecurity      : { type: 'addsecurity' },
  removeSecurity   : { type: 'rmsecurity' },
  changePass       : { type: 'password' },
  attachVolume     : { type: 'addvolume' },
  detachVolume     : { type: 'rmvolume', method: 'delete' },
  delete           : { type: 'delete', method: 'delete' },
  altMeta          : { type: 'editmeta', method: 'put' },
  listAction       : { type: 'list', method: 'get' }
};

var prototype = {
  getInstanceList: function (req, res, next) {
    var that = this;
    this.projectId = req.params.projectId;
    this.region = req.headers.region;
    this.token = req.session.user.token;
    async.parallel([
      function (callback) {
        that.nova.listServers(that.projectId, that.token, that.region, that.asyncHandler.bind(this, callback));
      }].concat(that.arrAsync),
      function (err, results) {
        if (err) {
          that.handleError(err, req, res, next);
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
  getFlavorList: function (req, res, next) {
    var that = this;
    this.projectId = req.params.projectId;
    this.region = req.headers.region;
    this.token = req.session.user.token;
    async.parallel([
      function (callback) {
        that.nova.listFlavors(that.projectId, that.token, that.region, that.asyncHandler.bind(this, callback));
      }],
      function (err, results) {
        if (err) {
          that.handleError(err, req, res, next);
        } else {
          var obj = {};
          obj.flavors = results[0].flavors;
          res.json({
            servers: obj.flavors
          });
        }
      });
  },
  getInstanceDetails: function (req, res, next) {
    var that = this;
    this.projectId = req.params.projectId;
    this.serverId = req.params.serverId;
    this.region = req.headers.region;
    this.token = req.session.user.token;
    async.parallel([
      function (callback) {
        that.nova.showServerDetails(that.projectId, that.serverId, that.token, that.region, that.asyncHandler.bind(this, callback));
      }].concat(that.arrAsync),
      function (err, results) {
        if (err) {
          that.handleError(err, req, res, next);
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
  operate: function (action, req, res, next) {
    var that = this;
    var token = req.session.user.token;
    var region = req.headers.region;
    // check if params required are given, and remove unnecessary params.
    var paramObj = this.paramChecker(this.nova, action, req, res);
    paramObj.project_id = req.params.projectId;
    if (req.params.serverId) {
      paramObj.server_id = req.params.serverId;
    }

    this.nova.action(token, region, function (err, payload) {
      if (err) {
        that.handleError(err, req, res, next);
      } else {
        res.json(payload.body);
      }
    }, action, paramObj);
  },
  initRoutes: function () {
    var that = this;
    this.app.get('/api/v1/:projectId/servers/detail', this.getInstanceList.bind(this));
    this.app.get('/api/v1/:projectId/flavors/detail', this.getFlavorList.bind(this));
    this.app.get('/api/v1/:projectId/servers/:serverId', this.getInstanceDetails.bind(this));
    this.app.post('/api/v1/:projectId/servers/action/create', this.operate.bind(this, 'create'));
    Object.keys(apiAction).forEach(function (action) {
      var api = apiAction[action];
      var method = api.method ? api.method : 'post';
      that.app[method]('/api/v1/:projectId/servers/:serverId/action/' + api.type, that.operate.bind(that, action));
    });
  }
};

module.exports = function (app, extension) {
  Object.assign(Instance.prototype, Base.prototype);
  Object.assign(Instance.prototype, prototype);
  if (extension) {
    Object.assign(Instance.prototype, extension);
  }
  var instance = new Instance(app, Nova, Glance, Cinder, Neutron);
  instance.initRoutes();
};
