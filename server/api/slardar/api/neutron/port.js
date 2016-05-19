'use strict';

const async = require('async');
const Base = require('../base.js');

// due to Port is reserved word
function Port (app) {
  this.app = app;
  this.arrServiceObject = ['floatingips', 'servers', 'security_groups'];
  Base.call(this, this.arrServiceObject);
}

Port.prototype = {
  makePort: function (port, obj) {
    obj.servers.some(function(server, i) {
      if ( server.id === port.device_id) {
        port.server = server;
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
    port.subnets = [];
    port.fixed_ips.forEach(function(e, index) {
      obj.subnets.some(function(subnet, i) {
        if ( subnet.id === e.subnet_id ) {
          port.subnets.push(subnet);
          return true;
        } else {
          return false;
        }
      });
    });
  },
  getPortList: function (req, res, next) {
    let objVar = this.getVars(req, ['projectId']);

    if (objVar.query.tenant_id) {
      /* tenant_id is set.*/
      async.parallel(
        [
          this.__externalNetworks.bind(this, objVar),
          this.__sharedNetworks.bind(this, objVar),
          this.__ports.bind(this, objVar)
        ].concat(this.arrAsync(objVar)),
        (error, theResults) => {
          if (error) {
            return this.handleError(error, req, res, next);
          }
          let obj = {};
          let externalNetwork = theResults[0].networks[0];
          let sharedNetwork = theResults[1].networks[0];

          ['ports'].concat(this.arrServiceObject).forEach( (e, index) => {
            obj[e] = theResults[index + 2][e];
          });

          let objVarExternal = JSON.parse(JSON.stringify(objVar));
          delete objVarExternal.query.tenant_id;
          objVarExternal.query.network_id = externalNetwork.id;

          let objVarShared = JSON.parse(JSON.stringify(objVar));
          delete objVarShared.query.tenant_id;
          objVarShared.query.network_id = sharedNetwork.id;

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

              this.orderByCreatedTime(obj.ports);
              obj.port = [];

              obj.ports.forEach( (port, index) => {
                let flag = true;
                // flag = Boolean(port.device_owner === 'compute:nova' || port.device_owner === 'compute:None' || port.device_owner === '');
                if (flag) {
                  obj.port.push(port);
                  this.makePort(port, obj);
                }
              });
              res.json({
                ports: obj.port
              });
            }
          );
        }
      );
    } else {

      async.parallel(
        [this.__ports.bind(this, objVar), this.__subnets.bind(this, objVar)].concat(this.arrAsync(objVar)),
        (err, results) => {
          if (err) {
            this.handleError(err, req, res, next);
          } else {
            let obj = {};
            ['ports', 'subnets'].concat(this.arrServiceObject).forEach( (e, index) => {
              obj[e] = results[index][e];
            });
            this.orderByCreatedTime(obj.ports);
            obj.port = [];
            obj.ports.forEach( (port, index) => {
              let flag = true;
              // flag = Boolean(port.device_owner === 'compute:nova' || port.device_owner === 'compute:None' || port.device_owner === '');
              if (flag) {
                obj.port.push(port);
                this.makePort(port, obj);
              }
            });
            res.json({
              ports: obj.port
            });
          }
        }
      );
    }
  },
  getPortDetails: function (req, res, next) {
    let objVar = this.getVars(req, ['projectId', 'portId']);
    async.parallel(
      [this.__portDetail.bind(this, objVar), this.__subnets.bind(this, objVar)].concat(this.arrAsync(objVar)),
      (err, results) => {
        if (err) {
          this.handleError(err, req, res, next);
        } else {
          let obj = {};
          ['port', 'subnets'].concat(this.arrServiceObject).forEach( (e, index) => {
            obj[e] = results[index][e];
          });
          this.makePort(obj.port, obj);
          res.json({
            port: obj.port
          });
        }
      });
  },
  initRoutes: function () {
    return this.__initRoutes( () => {
      this.app.get('/api/v1/:projectId/ports', this.getPortList.bind(this));
      this.app.get('/api/v1/:projectId/ports/:portId', this.getPortDetails.bind(this));
    });
  }
};


Object.assign(Port.prototype, Base.prototype);

module.exports = Port;
