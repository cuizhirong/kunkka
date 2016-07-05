'use strict';

const async = require('async');
const Base = require('../base.js');

function Subnet (app) {
  this.app = app;
  this.arrServiceObject = ['servers', 'routers', 'ports'];
  Base.call(this, this.arrServiceObject);
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
    let objVar = this.getVars(req, ['projectId']);

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
          let networks = theResults[2].networks;
          let arrRequestSubnet = [this.__subnets.bind(this, objVar)];
          obj.networks = [].concat(networks);

          // all itmes of not-self tenant.
          theResults[0].networks.concat(theResults[1].networks).forEach( e => {
            obj.networks.push(e);
            let objVarCopy = JSON.parse(JSON.stringify(objVar));
            delete objVarCopy.query.tenant_id;
            objVarCopy.query.network_id = e.id;
            arrRequestSubnet.push( this.__subnets.bind(this, objVarCopy) );
          });

          obj.networks = this.deduplicate(obj.networks);

          this.arrServiceObject.forEach( (e, index) => {
            obj[e] = theResults[index + 3][e];
          });

          async.parallel(arrRequestSubnet,
            (err, results) => {
              if (err) {
                return this.handleError(err, req, res, next);
              }
              obj.subnets = [];
              results.forEach( e => {
                obj.subnets = obj.subnets.concat(e.subnets);
              });

              /* remove duplications. */
              obj.subnets = this.deduplicate(obj.subnets);

              obj.subnets = obj.subnets.filter( s => {
                obj.networks.some( n => {
                  return n.id === s.network_id && (s.network = n);
                });
                return s.ip_version === 4;
              });
              obj.subnets.forEach( subnet => {
                this.makeSubnet(subnet, obj);
              });
              res.json({subnets: obj.subnets});
            }
          );
        }
      );
    } else {
      async.parallel(
        [this.__subnets.bind(this, objVar), this.__networks.bind(this, objVar)].concat(this.arrAsync(objVar)),
        (err, results) => {
          if (err) {
            this.handleError(err, req, res, next);
          } else {
            let obj = {};
            ['subnets', 'networks'].concat(this.arrServiceObject).forEach( (e, index) => {
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
    }
  },
  getSubnetDetails: function (req, res, next) {
    let objVar = this.getVars(req, ['projectId', 'subnetId']);
    async.parallel(
      [this.__subnetDetail.bind(this, objVar), this.__networks.bind(this, objVar)]
      .concat(this.arrAsync(objVar)),
      (err, results) => {
        if (err) {
          this.handleError(err, req, res, next);
        } else {
          let obj = {};
          ['subnet', 'networks'].concat(this.arrServiceObject).forEach( (e, index) => {
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
