'use strict';

var async = require('async');
var Base = require('../base.js');

function Instance(app) {
  this.app = app;
  this.arrService = ['nova', 'glance', 'cinder', 'neutron'];
  this.arrServiceObject = ['images', 'floatingips', 'subnets', 'ports', 'flavors', 'volumes', 'keypairs', 'security_groups'];
  Base.call(this, this.arrService, this.arrServiceObject);
}

Instance.prototype = {
  makeNetwork: function (server, obj) { /* floatingips, ports, subnets */
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
  },
  makeServer: function (server, obj) {
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
    this.makeNetwork(server, obj);
  },
  getInstanceList: function (req, res, next) {
    this.getVars(req, ['projectId']);
    async.parallel(
      [this.__servers.bind(this)].concat(this.arrAsync),
      (err, results) => {
        if (err) {
          this.handleError(err, req, res, next);
        } else {
          var obj = {};
          ['servers'].concat(this.arrServiceObject).forEach( (e, index) => {
            obj[e] = results[index][e];
          });
          this.orderByCreatedTime(obj.servers);
          obj.servers.forEach( server => {
            this.makeServer(server, obj);
          });
          res.json({
            servers: obj.servers
          });
        }
      }
    );
  },
  getFlavorList: function (req, res, next) {
    this.getVars(req, ['projectId']);
    async.parallel(
      [this.__flavors.bind(this)],
      (err, results) => {
        if (err) {
          this.handleError(err, req, res, next);
        } else {
          var obj = {};
          obj.flavors = results[0].flavors;
          res.json({
            flavors: obj.flavors
          });
        }
      });
  },
  getInstanceDetails: function (req, res, next) {
    this.getVars(req, ['projectId', 'serverId']);
    async.parallel(
      [this.__serverDetail.bind(this)].concat(this.arrAsync),
      (err, results) => {
        if (err) {
          this.handleError(err, req, res, next);
        } else {
          var obj = {};
          ['server'].concat(this.arrServiceObject).forEach( (e, index) => {
            obj[e] = results[index][e];
          });
          this.makeServer(obj.server, obj);
          res.json({
            server: obj.server
          });
        }
      });
  },
  initRoutes: function () {
    return this.__initRoutes( () => {
      this.app.get('/api/v1/:projectId/servers/detail', this.getInstanceList.bind(this));
      this.app.get('/api/v1/:projectId/flavors/detail', this.getFlavorList.bind(this));
      this.app.get('/api/v1/:projectId/servers/:serverId', this.getInstanceDetails.bind(this));
    });
  }
};

Object.assign(Instance.prototype, Base.prototype);

module.exports = Instance;
