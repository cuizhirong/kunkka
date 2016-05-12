'use strict';

const async = require('async');
const Base = require('../base.js');

function Network (app) {
  this.app = app;
  this.arrServiceObject = ['subnets', 'ports', 'routers'];
  Base.call(this, this.arrServiceObject);
}

Network.prototype = {
  makeNetwork: function (network, obj) {
    network.subnets.forEach(function (subnet, index) {
      obj.subnets.some(function (sub) {
        if (sub.id === subnet) {
          network.subnets[index] = sub;
          obj.ports.forEach(function(port){
            if (port.network_id === network.id && port.device_owner === 'network:router_interface') {
              port.fixed_ips.some(function(s){
                if (s.subnet_id === subnet) {
                  obj.routers.some(function(router){
                    if (router.id === port.device_id) {
                      sub.router = router;
                      return true;
                    } else {
                      return false;
                    }
                  });
                  return true;
                } else {
                  return false;
                }
              });
            }
          });
          return true;
        } else {
          return false;
        }
      });
    });
  },
  getNetworkList: function (req, res, next) {
    let objVar = this.getVars(req);
    let requestList;
    if (objVar.query.tenant_id) {
      requestList = [this.__networks.bind(this, objVar), this.__externalNetworks.bind(this, objVar), this.__sharedNetworks.bind(this, objVar)].concat(this.arrAsync(objVar));
    } else {
      requestList = [this.__networks.bind(this, objVar)].concat(this.arrAsync(objVar));
    }
    async.parallel(
      requestList,
      (err, results) => {
        if (err) {
          this.handleError(err, req, res, next);
        } else {
          let obj = {};
          if (objVar.query.tenant_id) {
            ['networks', 'externalNetworks', 'sharedNetworks'].concat(this.arrServiceObject).forEach( (e, index) => {
              if (e === 'externalNetworks' || e === 'sharedNetworks') {
                obj[e] = results[index].networks;
              } else {
                obj[e] = results[index][e];
              }
            });
            obj.realNetworks = obj.networks.concat(obj.externalNetworks, obj.sharedNetworks);
          } else {
            ['networks'].concat(this.arrServiceObject).forEach( (e, index) => {
              obj[e] = results[index][e];
            });
            obj.realNetworks = obj.networks;
          }
          this.orderByCreatedTime(obj.realNetworks);
          obj.realNetworks.forEach( network => {
            this.makeNetwork(network, obj);
          });
          res.json({networks: obj.realNetworks});
        }
      }
    );
  },
  getNetworkDetails: function (req, res, next) {
    let objVar = this.getVars(req, ['networkId']);
    async.parallel(
      [this.__networkDetail.bind(this, objVar)].concat(this.arrAsync(objVar)),
      (err, results) => {
        if (err) {
          this.handleError(err, req, res, next);
        } else {
          let obj = {};
          ['network'].concat(this.arrServiceObject).forEach( (e, index) => {
            obj[e] = results[index][e];
          });
          this.makeNetwork(obj.network, obj);
          res.json({network: obj.network});
        }
      }
    );
  },
  initRoutes: function () {
    return this.__initRoutes( () => {
      this.app.get('/api/v1/networks', this.getNetworkList.bind(this));
      this.app.get('/api/v1/networks/:networkId', this.getNetworkDetails.bind(this));
    });
  }
};

Object.assign(Network.prototype, Base.prototype);

module.exports = Network;
