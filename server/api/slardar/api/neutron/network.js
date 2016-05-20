'use strict';

const async = require('async');
const Base = require('../base.js');

function Network (app) {
  this.app = app;
  this.arrServiceObject = ['ports', 'routers'];
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

    if (objVar.query.tenant_id) {
      /* tenant_id is set.*/
      async.parallel(
        [
          this.__externalNetworks.bind(this, objVar),
          this.__sharedNetworks.bind(this, objVar),
          this.__networks.bind(this, objVar)
        ].concat(this.arrAsync(objVar)),
        (error, theResults) => {
          if (error) {
            return this.handleError(error, req, res, next);
          }
          let obj = {};
          let externalNetwork;
          let sharedNetwork;
          let networks = theResults[2].networks;
          obj.networks = [].concat(networks);

          if (theResults[0].networks.length) {
            externalNetwork = theResults[0].networks[0];
            obj.networks.push(externalNetwork);
          }
          if (theResults[1].networks.length) {
            sharedNetwork = theResults[1].networks[0];
            obj.networks.push(sharedNetwork);
          }

          obj.networks = this.deduplicate(obj.networks);

          this.arrServiceObject.forEach( (e, index) => {
            obj[e] = theResults[index + 3][e];
          });

          let objVarExternal = JSON.parse(JSON.stringify(objVar));
          delete objVarExternal.query.tenant_id;

          if (externalNetwork) {
            objVarExternal.query.network_id = externalNetwork.id;
          } else {
            objVarExternal.query.network_id = 'null';
          }

          let objVarShared = JSON.parse(JSON.stringify(objVar));
          delete objVarShared.query.tenant_id;

          if (sharedNetwork) {
            objVarShared.query.network_id = sharedNetwork.id;
          } else {
            objVarShared.query.network_id = 'null';
          }

          async.parallel(
            [
              this.__subnets.bind(this, objVarExternal),
              this.__subnets.bind(this, objVarShared),
              this.__subnets.bind(this, objVar)
            ],
            (err, results) => {
              if (err) {
                return this.handleError(err, req, res, next);
              }
              let externalSubnets = results[0].subnets;
              let sharedSubnets = results[1].subnets;
              let userSubnets = results[2].subnets;
              obj.subnets = userSubnets.concat(externalSubnets, sharedSubnets);

              obj.subnets = this.deduplicate(obj.subnets);

              this.orderByCreatedTime(obj.networks);
              obj.networks.forEach( network => {
                this.makeNetwork(network, obj);
              });
              res.json({networks: obj.networks});
            }
          );
        }
      );
    } else {

      async.parallel(
        [this.__networks.bind(this, objVar), this.__subnets.bind(this, objVar)].concat(this.arrAsync(objVar)),
        (err, results) => {
          if (err) {
            this.handleError(err, req, res, next);
          } else {
            let obj = {};
            ['networks', 'subnets'].concat(this.arrServiceObject).forEach( (e, index) => {
              obj[e] = results[index][e];
            });
            this.orderByCreatedTime(obj.networks);
            obj.networks.forEach( network => {
              this.makeNetwork(network, obj);
            });
            res.json({networks: obj.networks});
          }
        }
      );
    }
  },
  getNetworkDetails: function (req, res, next) {
    let objVar = this.getVars(req, ['networkId']);
    async.parallel(
      [this.__networkDetail.bind(this, objVar), this.__subnets.bind(this, objVar)].concat(this.arrAsync(objVar)),
      (err, results) => {
        if (err) {
          this.handleError(err, req, res, next);
        } else {
          let obj = {};
          ['network', 'subnets'].concat(this.arrServiceObject).forEach( (e, index) => {
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
