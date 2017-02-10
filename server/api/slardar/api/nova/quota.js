'use strict';

const async = require('async');
const Base = require('../base.js');

function Overview(app) {
  this.app = app;
  this.arrQuotaObject = ['novaQuota', 'cinderQuota', 'neutronQuota'];
  this.arrListObject = ['servers', 'flavors', 'volumeTypes', 'security_groups', 'routers', 'subnets', 'floatingips', 'snapshots', 'keypairs', 'networks', 'ports', 'loadBalancers', 'listeners', 'pools'];
  this.arrServiceObject = this.arrQuotaObject.concat(this.arrListObject);
  Base.call(this, this.arrServiceObject);
}

Overview.prototype = {
  getQuota: function (req, res, next) {
    let objVar = this.getVars(req, ['projectId', 'targetId']);
    async.parallel(
      this.arrAsync(objVar).slice(0, 3).concat(this.__volumeTypes.bind(this, objVar)),
      (err, results) => {
        if (err) {
          this.handleError(err, req, res, next);
        } else {
          let obj = {};
          this.arrQuotaObject.forEach( (e, index) => {
            obj[e] = results[index][Object.keys(results[index])[0]];
          });
          obj.quota = {
            ram            : { total: obj.novaQuota.ram },
            cores          : { total: obj.novaQuota.cores },
            instances      : { total: obj.novaQuota.instances },
            key_pairs      : { total: obj.novaQuota.key_pairs },

            port           : { total: obj.neutronQuota.port },
            subnet         : { total: obj.neutronQuota.subnet },
            router         : { total: obj.neutronQuota.router },
            network        : { total: obj.neutronQuota.network },
            floatingip     : { total: obj.neutronQuota.floatingip },
            security_group : { total: obj.neutronQuota.security_group },
            loadbalancer   : { total: obj.neutronQuota.loadbalancer },
            listener       : { total: obj.neutronQuota.listener },
            pool           : { total: obj.neutronQuota.pool },

            volumes        : { total: obj.cinderQuota.volumes.limit },
            gigabytes      : { total: obj.cinderQuota.gigabytes.limit },
            snapshots      : { total: obj.cinderQuota.snapshots.limit }
          };
          results[3].volume_types.forEach((type) => {
            obj.quota['volumes_' + type.name] = { total: obj.cinderQuota[ 'volumes_' + type.name].limit };
            obj.quota['gigabytes_' + type.name] = { total: obj.cinderQuota[ 'gigabytes_' + type.name].limit };
            obj.quota['snapshots_' + type.name] = { total: obj.cinderQuota[ 'snapshots_' + type.name].limit };
          });
          res.json({'quota': obj.quota});
        }
      }
    );
  },
  getOverview: function (req, res, next) {
    let objVar = this.getVars(req, ['projectId']);
    // /api/v1/:projectId/overview?all_tenants=1&tenant_id=xxx   admin get other tenant overview
    if (objVar.query.tenant_id && objVar.query.all_tenants) {
      objVar.targetId = objVar.query.tenant_id;
    } else {
      objVar.query.tenant_id = objVar.projectId;
    }
    async.parallel(
      this.arrAsync(objVar),
      (err, results) => {
        if (err) {
          this.handleError(err, req, res, next);
        } else {
          let obj = {};
          obj.arrVolumeTypes = [];
          /* make up obj with serverObjects returned. */
          this.arrServiceObject.forEach( (e, index) => {
            obj[e] = results[index][Object.keys(results[index])[0]];
          });
          /* case when is admin, here will only return its belongings.*/
          // this.arrListObject.forEach( e => {
          //   let service = obj[e];
          //   if (service[0] && service[0].tenant_id) {
          //     obj[e] = service.filter( s => {
          //       return s.tenant_id === this.projectId;
          //     });
          //   }
          // });
          obj.overview_usage = {
            ram            : { total: obj.novaQuota.ram, used: 0 },
            cores          : { total: obj.novaQuota.cores, used: 0 },
            instances      : { total: obj.novaQuota.instances, used: 0 },
            key_pairs      : { total: obj.novaQuota.key_pairs, used: Object.keys(obj.keypairs).length },

            port           : { total: obj.neutronQuota.port, used: Object.keys(obj.ports).length },
            subnet         : { total: obj.neutronQuota.subnet, used: Object.keys(obj.subnets).length },
            router         : { total: obj.neutronQuota.router, used: Object.keys(obj.routers).length },
            network        : { total: obj.neutronQuota.network, used: Object.keys(obj.networks).length },
            floatingip     : { total: obj.neutronQuota.floatingip, used: Object.keys(obj.floatingips).length },
            security_group : { total: obj.neutronQuota.security_group, used: Object.keys(obj.security_groups).length },
            loadbalancer   : { total: obj.neutronQuota.loadbalancer, used: Object.keys(obj.loadBalancers).length },
            listener       : { total: obj.neutronQuota.listener, used: Object.keys(obj.listeners).length },
            pool           : { total: obj.neutronQuota.pool, used: Object.keys(obj.pools).length },

            volumes        : { total: obj.cinderQuota.volumes.limit, used: obj.cinderQuota.volumes.in_use },
            gigabytes      : { total: obj.cinderQuota.gigabytes.limit, used: obj.cinderQuota.gigabytes.in_use },
            snapshots      : { total: obj.cinderQuota.snapshots.limit, used: obj.cinderQuota.snapshots.in_use }
          };
          obj.volumeTypes.forEach( a => {
            obj.overview_usage['volumes_' + a.name] = { total: obj.cinderQuota[ 'volumes_' + a.name].limit, used: obj.cinderQuota[ 'volumes_' + a.name].in_use};
            obj.overview_usage['gigabytes_' + a.name] = { total: obj.cinderQuota[ 'gigabytes_' + a.name].limit, used: obj.cinderQuota[ 'gigabytes_' + a.name].in_use};
            obj.overview_usage['snapshots_' + a.name] = { total: obj.cinderQuota[ 'snapshots_' + a.name].limit, used: obj.cinderQuota[ 'snapshots_' + a.name].in_use};
            obj.arrVolumeTypes.push(a.name);
          });
          /* deal with nova. */
          let flavor = {};
          obj.servers.forEach( s => {
            flavor[s.flavor.id] ? flavor[s.flavor.id]++ : flavor[s.flavor.id] = 1;
          });
          obj.flavors.forEach( f => {
            if (flavor[f.id]) {
              let num = flavor[f.id];
              obj.overview_usage.cores.used += num * f.vcpus;
              obj.overview_usage.ram.used += num * f.ram;
              obj.overview_usage.instances.used += num;
            } else {
              return;
            }
          });
          /* deal with cinder. */
          // let snapshot = {};
          // obj.snapshots.forEach( s => {
          //   obj.overview_usage.snapshots.used += 1;
          //   snapshot[s.volume_id] ? snapshot[s.volume_id]++ : snapshot[s.volume_id] = 1;
          // });
          // obj.volumes.forEach( v => {
          //   obj.overview_usage.volumes.used += 1;
          //   obj.overview_usage.gigabytes.used += v.size;
          //   let type = v.volume_type;
          //   if (obj.arrVolumeTypes.indexOf(type) !== -1) {
          //     obj.overview_usage['volumes_' + type].used += 1;
          //     obj.overview_usage['gigabytes_' + type].used += v.size;
          //     if (snapshot[v.id]) {
          //       obj.overview_usage['snapshots_' + type].used += snapshot[v.id];
          //     }
          //   }
          // });
          /* sort by first letter. */

          res.json({
            overview_usage: obj.overview_usage,
            volume_types: obj.arrVolumeTypes
          });
        }
      }
    );
  },
  putQuota: function (req, res, next) {
    let objVar = this.getVars(req, ['projectId', 'targetId']);
    let novaItems = ['ram', 'cores', 'instances', 'key_pairs'];
    let cinderItems = ['volumes', 'gigabytes', 'snapshots'];
    let neutronItems = ['port', 'subnet', 'router', 'network', 'floatingip', 'security_group', 'loadbalancer', 'listener', 'pool'];
    let body = req.body;
    let tasks = [];
    this.__volumeTypes(objVar, (err, types) => {
      if (err) {
        next(err);
      } else {
        types.volume_types.forEach((type) => {
          cinderItems.push('volumes_' + type.name);
          cinderItems.push('gigabytes_' + type.name);
          cinderItems.push('snapshots_' + type.name);
        });
        let setBody = (s, k) => {
          if (!objVar[s + 'Body']) {
            objVar[s + 'Body'] = {};
            tasks.push(this['__' + s + 'QuotaUpdate'].bind(this, objVar));
          }
          objVar[s + 'Body'][k] = body[k];
        };
        Object.keys(body).forEach( k => {
          if (novaItems.indexOf(k) !== -1) {
            setBody('nova', k);
          } else if (cinderItems.indexOf(k) !== -1) {
            setBody('cinder', k);
          } else if (neutronItems.indexOf(k) !== -1) {
            setBody('neutron', k);
          }
        });
        async.parallel(
          tasks,
          (_err, results) => {
            if (err) {
              this.handleError(_err, req, res, next);
            } else {
              res.status(204).send();
            }
          }
        );
      }
    });
  },
  initRoutes: function () {
    this.app.get('/api/v1/:projectId/overview', this.getOverview.bind(this));
    this.app.get('/api/v1/:projectId/quota/:targetId', this.getQuota.bind(this));
    this.app.put('/api/v1/:projectId/quota/:targetId', this.putQuota.bind(this));
  }
};

Object.assign(Overview.prototype, Base.prototype);

module.exports = Overview;
