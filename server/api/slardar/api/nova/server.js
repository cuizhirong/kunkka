'use strict';

const async = require('async');
const co = require('co');

const Base = require('../base.js');
const adminLogin = require('../../common/adminLogin');
const driver = require('server/drivers');
const config = require('config');

function Instance(app) {
  this.app = app;
  this.arrServiceObject = ['images', 'flavors', 'volumes', 'keypairs', 'security_groups'];
  Base.call(this, this.arrServiceObject);
}

Instance.prototype = {
  makeNetwork: function(server, obj) { /* floatingips, ports, subnets */
    let addresses = server.addresses;
    let _floatingip;
    let _fixedIps = [];
    let ipv6 = [];
    Object.keys(addresses).forEach(function(el) {
      ipv6 = [];
      addresses[el].forEach(function(e, index) {
        e.security_groups = [];
        if (e.version === 6) {
          ipv6.push(index);
        } else { // ipv4
          if (e['OS-EXT-IPS:type'] === 'fixed') {
            _fixedIps.push(e.addr);
            if (obj.ports) {
              obj.ports.some(function(p) {
                if (p.device_id === server.id && p.mac_address === e['OS-EXT-IPS-MAC:mac_addr']) {
                  e.port = p;
                  if (p.fixed_ips.length) {
                    obj.subnets.some(function(sub) {
                      if (sub.id === p.fixed_ips[0].subnet_id) {
                        e.subnet = sub;
                      }
                    });
                  }
                  p.security_groups.forEach(function(security) {
                    obj.security_groups.some(function(scu) {
                      if (scu.id === security) {
                        e.security_groups.push(scu);
                      }
                    });
                  });
                }
              });
            }
          } else { // floating
            obj.floatingips.some(function(floatingip) {
              return e.addr === floatingip.floating_ip_address && (_floatingip = floatingip);
            });
          }
        }
      });
      ipv6.reverse().forEach(function(i) {
        addresses[el].splice(i, 1);
      });
    });
    server.fixed_ips = _fixedIps;
    server.floating_ip = _floatingip;
  },
  makeServer: function(server, obj) {
    server.volume = [];
    server.instance_snapshot = [];
    delete server.links;
    obj.flavors.some(function(flavor) {
      return flavor.id === server.flavor.id && (delete flavor.links) && (server.flavor = flavor);
    });
    obj.images.forEach(function(image) {
      if (image.id === server.image.id) {
        delete image.links;
        server.image = image;
      } else if (image.image_type && image.image_type === 'snapshot' && image.instance_uuid === server.id) {
        server.instance_snapshot.push(image);
      } else {
        return true;
      }
    });
    server['os-extended-volumes:volumes_attached'].forEach(function(e) {
      obj.volumes.some(function(ele) {
        return e.id === ele.id && delete ele.links && server.volume.push(ele);
      });
    });
    obj.keypairs.some(function(e) {
      return e.keypair.name === server.key_name && (server.keypair = e.keypair);
    });
    this.makeNetwork(server, obj);
  },
  getInstanceList: function(req, res, next) {
    req.query.tenant_id = req.params.projectId;
    let objVar = this.getVars(req, ['projectId']);
    let objVarSpec = JSON.parse(JSON.stringify(objVar));

    delete objVar.query.tenant_id;

    if (objVar.query.tenant_id) {
      /* tenant_id is set.*/
      async.parallel(
        [
          this.__externalNetworks.bind(this, objVarSpec),
          this.__sharedNetworks.bind(this, objVarSpec),
          this.__floatingips.bind(this, objVarSpec),
          this.__ports.bind(this, objVarSpec),
          this.__servers.bind(this, objVar)
        ].concat(this.arrAsync(objVar)),
        (error, theResults) => {
          if (error) {
            return this.handleError(error, req, res, next);
          }
          let obj = {};
          let arrRequestSubnet = [this.__subnets.bind(this, objVar)];

          // all itmes of not-self tenant.
          theResults[0].networks.concat(theResults[1].networks).forEach(e => {
            let objVarCopy = JSON.parse(JSON.stringify(objVar));
            delete objVarCopy.query.tenant_id;
            objVarCopy.query.network_id = e.id;
            arrRequestSubnet.push(this.__subnets.bind(this, objVarCopy));
          });

          ['floatingips', 'ports', 'servers'].concat(this.arrServiceObject).forEach((e, index) => {
            obj[e] = theResults[index + 2][e];
          });

          async.parallel(arrRequestSubnet,
            (err, results) => {
              if (err) {
                return this.handleError(err, req, res, next);
              }
              obj.subnets = [];
              results.forEach(e => {
                obj.subnets = obj.subnets.concat(e.subnets);
              });

              obj.subnets = this.deduplicate(obj.subnets);

              this.orderByCreatedTime(obj.servers);
              obj.servers.forEach(server => {
                this.makeServer(server, obj);
              });
              res.json({
                servers: obj.servers
              });
            }
          );
        }
      );
    } else {
      async.parallel(
        [
          this.__servers.bind(this, objVar),
          this.__subnets.bind(this, objVar),
          this.__floatingips.bind(this, objVar),
          this.__ports.bind(this, objVar)
        ].concat(this.arrAsync(objVar)),
        (err, results) => {
          if (err) {
            this.handleError(err, req, res, next);
          } else {
            let obj = {};
            ['servers', 'subnets', 'floatingips', 'ports'].concat(this.arrServiceObject).forEach((e, index) => {
              obj[e] = results[index][e];
            });
            this.orderByCreatedTime(obj.servers);
            obj.servers.forEach(server => {
              this.makeServer(server, obj);
            });
            res.json({
              servers: obj.servers
            });
          }
        }
      );
    }
  },
  getFlavorList: function(req, res, next) {
    let objVar = this.getVars(req, ['projectId']);
    async.parallel(
      [this.__flavors.bind(this, objVar)],
      (err, results) => {
        if (err) {
          this.handleError(err, req, res, next);
        } else {
          let obj = {};
          obj.flavors = results[0].flavors;
          res.json({
            flavors: obj.flavors
          });
        }
      });
  },
  getInstanceDetails: function(req, res, next) {
    let objVar = this.getVars(req, ['projectId', 'serverId']);
    async.parallel(
      [
        this.__serverDetail.bind(this, objVar),
        this.__subnets.bind(this, objVar),
        this.__floatingips.bind(this, objVar),
        this.__ports.bind(this, objVar)
      ].concat(this.arrAsync(objVar)),
      (err, results) => {
        if (err) {
          this.handleError(err, req, res, next);
        } else {
          let obj = {};
          ['server', 'subnets', 'floatingips', 'ports'].concat(this.arrServiceObject).forEach((e, index) => {
            obj[e] = results[index][e];
          });
          this.makeServer(obj.server, obj);
          res.json({
            server: obj.server
          });
        }
      });
  },
  getVNCConsole: function(req, res, next) {
    let objVar = {};
    objVar.region = req.query.region;
    objVar.endpoint = req.session.endpoint;
    objVar.token = req.session.user.token;
    objVar.projectId = req.params.projectId;
    objVar.serverId = req.params.serverId;
    this.__getVNCConsole(objVar, (err, payload) => {
      if (err) {
        this.handleError(err, req, res, next);
      } else {
        let url = payload.console.url + '&title=' + req.params.serverId;
        res.redirect(url);
      }
    });
  },
  getSoftDeletedServers: function(req, res, next) {
    co(function*() {
      const region = req.headers.region;
      const adminTokenObj = yield adminLogin();
      const softDeletedServers = yield driver.nova.server.listServersAsync(config('admin_projectId'), adminTokenObj.token, adminTokenObj.remote.nova[region], {
        all_tenants: 1,
        tenant_id: req.params.projectId,
        deleted: 'True',
        status: 'soft_deleted'
      });
      res.json(softDeletedServers.body);
    }).catch(e => {
      next(e);
    });
  },
  initRoutes: function() {
    return this.__initRoutes(() => {
      this.app.get('/api/v1/:projectId/servers/detail', this.getInstanceList.bind(this));
      this.app.get('/api/v1/:projectId/servers/soft_deleted', this.getSoftDeletedServers.bind(this));
      this.app.get('/api/v1/:projectId/flavors/detail', this.getFlavorList.bind(this));
      this.app.get('/api/v1/:projectId/servers/:serverId', this.getInstanceDetails.bind(this));
      this.app.get('/api/v1/:projectId/servers/:serverId/vnc', this.getVNCConsole.bind(this));
    });
  }
};

Object.assign(Instance.prototype, Base.prototype);

module.exports = Instance;
