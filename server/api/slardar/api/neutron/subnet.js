'use strict';

var async = require('async');
var Base = require('../base.js');

function Subnet (app) {
  this.app = app;
  this.arrService = ['neutron', 'nova'];
  this.arrServiceObject = ['servers', 'networks', 'routers', 'ports'];
  Base.call(this, this.arrService, this.arrServiceObject);
}

Subnet.prototype = {
  makeSubnet: function(subnet, obj) {
    obj.networks.some(function (n) {
      return subnet.network_id === n.id && (subnet.network = n);
    });
    subnet.ports = [];
    subnet.router = {};
    obj.ports.forEach(function (p) {
      p.fixed_ips.some(function (ip) {
        if (ip.subnet_id === subnet.id) {
          if (p.device_owner === 'compute:nova' || p.device_owner === 'compute:None') {
            if (obj.servers) {
              obj.servers.some(function(server) {
                return server.id === p.device_id && (p.server = server);
              });
            }
          } else if (p.device_owner === 'network:router_interface') {
            obj.routers.some(function (r) {
              return r.id === p.device_id && (subnet.router = r);
            });
          }
          subnet.ports.push(p);
          return true;
        } else {
          return false;
        }
      });
    });
  },
  getSubnetList: function (req, res, next) {
    this.getVars(req, ['projectId']);
    async.parallel(
      [this.__subnets.bind(this)].concat(this.arrAsync),
      (err, results) => {
        if (err) {
          this.handleError(err, req, res, next);
        } else {
          var obj = {};
          ['subnets'].concat(this.arrServiceObject).forEach( (e, index) => {
            obj[e] = results[index][e];
          });
          this.orderByCreatedTime(obj.subnets);
          obj.subnets = obj.subnets.filter( s => {
            obj.networks.some( n => {
              return n.id === s.network_id && (s.network = n);
            });
            return s.ip_version === 4 && s.network['router:external'] === false;
          });
          obj.subnets.forEach( subnet => {
            this.makeSubnet(subnet, obj);
          });
          res.json({subnets: obj.subnets});
        }
      }
    );
  },
  getSubnetDetails: function (req, res, next) {
    this.getVars(req, ['projectId', 'subnetId']);
    async.parallel(
      [this.__subnetDetail.bind(this)]
      .concat(this.arrAsync, [this.__servers.bind(this)]),
      (err, results) => {
        if (err) {
          this.handleError(err, req, res, next);
        } else {
          var obj = {};
          ['subnet'].concat(this.arrServiceObject, ['servers']).forEach( (e, index) => {
            obj[e] = results[index][e];
          });
          this.makeSubnet(obj.subnet, obj);
          res.json({subnet: obj.subnet});
        }
      }
    );
  },
  initRoutes: function () {
    return this.__initRoutes( () => {
      this.app.get('/api/v1/:projectId/subnets', this.getSubnetList.bind(this));
      this.app.get('/api/v1/:projectId/subnets/:subnetId', this.getSubnetDetails.bind(this));
    });
  }
};

Object.assign(Subnet.prototype, Base.prototype);

module.exports = Subnet;
