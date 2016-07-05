'use strict';

const async = require('async');
const Base = require('../base.js');

function Router (app, neutron) {
  this.app = app;
  this.arrServiceObject = ['floatingips', 'ports'];
  Base.call(this, this.arrServiceObject);
}

Router.prototype = {
  makeRouter: function (router, obj) {
    router.floatingip = {}; // customized floatingip.
    obj.floatingips.some(function (fip) {
      obj.ports.some(function (port) {
        if (port.id === fip.port_id && port.device_owner === 'network:router_gateway' && port.device_id === router.id) {
          router.floatingip = fip;
          return true;
        } else {
          return false;
        }
      });
      // return fip.router_id === router.id && (router.floatingip = fip);
    });
    router.subnets = [];
    obj.ports.forEach(function (port) {
      if (port.device_id === router.id && port.device_owner === 'network:router_interface') {
        obj.subnets.forEach(function (subnet) {
          if (subnet.ip_version === 4 && subnet.id === port.fixed_ips[0].subnet_id) {
            router.subnets.push(subnet);
          }
        });
      }
    });
  },
  getRouterList: function (req, res, next) {
    let objVar = this.getVars(req);

    if (objVar.query.tenant_id) {
      /* tenant_id is set.*/
      async.parallel(
        [
          this.__externalNetworks.bind(this, objVar),
          this.__sharedNetworks.bind(this, objVar),
          this.__routers.bind(this, objVar)
        ].concat(this.arrAsync(objVar)),
        (error, theResults) => {
          if (error) {
            return this.handleError(error, req, res, next);
          }
          let obj = {};
          let arrRequestSubnet = [this.__subnets.bind(this, objVar)];

          // all itmes of not-self tenant.
          theResults[0].networks.concat(theResults[1].networks).forEach( e => {
            let objVarCopy = JSON.parse(JSON.stringify(objVar));
            delete objVarCopy.query.tenant_id;
            objVarCopy.query.network_id = e.id;
            arrRequestSubnet.push( this.__subnets.bind(this, objVarCopy) );
          });

          ['routers'].concat(this.arrServiceObject).forEach( (e, index) => {
            obj[e] = theResults[index + 2][e];
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

              obj.subnets = this.deduplicate(obj.subnets);

              this.orderByCreatedTime(obj.routers);
              obj.routers.forEach( (router) => {
                this.makeRouter(router, obj);
              });
              res.json({routers: obj.routers});
            }
          );
        }
      );
    } else {
      async.parallel(
        [this.__routers.bind(this, objVar), this.__subnets.bind(this, objVar)].concat(this.arrAsync(objVar)),
        (err, results) => {
          if (err) {
            this.handleError(err, req, res, next);
          } else {
            let obj = {};
            ['routers', 'subnets'].concat(this.arrServiceObject).forEach( (e, index) => {
              obj[e] = results[index][e];
            });
            this.orderByCreatedTime(obj.routers);
            obj.routers.forEach( (router) => {
              this.makeRouter(router, obj);
            });
            res.json({routers: obj.routers});
          }
        }
      );
    }
  },
  getRouterDetails: function (req, res, next) {
    let objVar = this.getVars(req, ['routerId']);
    async.parallel(
      [this.__routerDetail.bind(this, objVar), this.__subnets.bind(this, objVar)].concat(this.arrAsync(objVar)),
      (err, results) => {
        if (err) {
          this.handleError(err, req, res, next);
        } else {
          let obj = {};
          ['router', 'subnets'].concat(this.arrServiceObject).forEach( (e, index) => {
            obj[e] = results[index][e];
          });
          this.makeRouter(obj.router, obj);
          res.json({routers: obj.router});
        }
      }
    );
  },
  initRoutes: function () {
    return this.__initRoutes( () => {
      this.app.get('/api/v1/routers', this.getRouterList.bind(this));
      this.app.get('/api/v1/routers/:routerId', this.getRouterDetails.bind(this));
    });
  }
};

Object.assign(Router.prototype, Base.prototype);

module.exports = Router;
