'use strict';

const Driver = require('server/drivers');

function API (arrService, arrServiceObject) {
  this.arrAsync = [];
  /* get services. */
  if (arrService) {
    arrService.forEach( s => this[s] = Driver[s] );
  }
  /* get methods of show serviceObject list. */
  if (arrServiceObject) {
    arrServiceObject.forEach( s => this.arrAsync.push(this['__' + s].bind(this)) );
  }
}

API.prototype = {
  __users: function (callback) {
    this.keystone.user.listUsers(this.token, this.asyncHandler.bind(undefined, callback), this.query);
  },
  __projects: function (callback) {
    this.keystone.project.listProjects(this.token, this.asyncHandler.bind(undefined, callback), this.query);
  },
  __hosts: function (callback) {
    this.nova.host.listHosts(this.projectId, this.token, this.region, this.asyncHandler.bind(undefined, callback), this.query);
  },
  __servers: function (callback) {
    this.nova.server.listServers(this.projectId, this.token, this.region, this.asyncHandler.bind(undefined, callback), this.query);
  },
  __flavors: function (callback) {
    this.nova.flavor.listFlavors(this.projectId, this.token, this.region, this.asyncHandler.bind(undefined, callback), this.query);
  },
  __keypairs: function (callback) {
    this.nova.keypair.listKeypairs(this.projectId, this.token, this.region, this.asyncHandler.bind(undefined, callback), this.query);
  },
  __volumes: function (callback) {
    this.cinder.volume.listVolumes(this.projectId, this.token, this.region, this.asyncHandler.bind(undefined, callback), this.query);
  },
  __volumeTypes: function (callback) {
    this.cinder.volume.listVolumeTypes(this.projectId, this.token, this.region, this.asyncHandler.bind(undefined, callback), this.query);
  },
  __snapshots: function (callback) {
    this.cinder.snapshot.listSnapshots(this.projectId, this.token, this.region, this.asyncHandler.bind(undefined, callback), this.query);
  },
  __floatingips: function (callback) {
    this.neutron.floatingip.listFloatingips(this.token, this.region, this.asyncHandler.bind(undefined, callback), this.query);
  },
  __networks: function (callback) {
    this.neutron.network.listNetworks(this.token, this.region, this.asyncHandler.bind(undefined, callback), this.query);
  },
  __ports: function (callback) {
    this.neutron.port.listPorts(this.token, this.region, this.asyncHandler.bind(undefined, callback), this.query);
  },
  __routers: function (callback) {
    this.neutron.router.listRouters(this.token, this.region, this.asyncHandler.bind(undefined, callback), this.query);
  },
  __security_groups: function (callback) {
    this.neutron.security.listSecurity(this.projectId, this.token, this.region, this.asyncHandler.bind(undefined, callback), this.query);
  },
  __subnets: function (callback) {
    this.neutron.subnet.listSubnets(this.token, this.region, this.asyncHandler.bind(undefined, callback), this.query);
  },
  __images: function (callback) {
    this.glance.image.listImages(this.token, this.region, this.asyncHandler.bind(undefined, callback), this.query);
  },
  __novaQuota: function (callback) {
    this.nova.quota.getQuota(this.projectId, this.targetId, this.token, this.region, this.asyncHandler.bind(undefined, callback), this.query);
  },
  __cinderQuota: function (callback) {
    this.cinder.quota.getQuota(this.projectId, this.targetId, this.token, this.region, this.asyncHandler.bind(undefined, callback), this.query);
  },
  __neutronQuota: function (callback) {
    this.neutron.quota.getQuota(this.projectId, this.targetId, this.token, this.region, this.asyncHandler.bind(undefined, callback), this.query);
  },
  __serverDetail: function (callback) {
    this.nova.server.showServerDetails(this.projectId, this.serverId, this.token, this.region, this.asyncHandler.bind(undefined, callback), this.query);
  },
  __volumeDetail: function (callback) {
    this.cinder.volume.showVolumeDetails(this.projectId, this.volumeId, this.token, this.region, this.asyncHandler.bind(undefined, callback), this.query);
  },
  __snapshotDetail: function (callback) {
    this.cinder.snapshot.showSnapshotDetails(this.projectId, this.snapshotId, this.token, this.region, this.asyncHandler.bind(undefined, callback), this.query);
  },
  __imageDetail: function (callback) {
    this.glance.image.showImageDetails(this.imageId, this.token, this.region, this.asyncHandler.bind(undefined, callback), this.query);
  },
  __floatingipDetail: function (callback) {
    this.neutron.floatingip.showFloatingipDetails(this.floatingipId, this.token, this.region, this.asyncHandler.bind(undefined, callback), this.query);
  },
  __networkDetail: function (callback) {
    this.neutron.network.showNetworkDetails(this.networkId, this.token, this.region, this.asyncHandler.bind(undefined, callback), this.query);
  },
  __portDetail: function (callback) {
    this.neutron.port.showPortDetails(this.portId, this.token, this.region, this.asyncHandler.bind(undefined, callback), this.query);
  },
  __routerDetail: function (callback) {
    this.neutron.router.showRouterDetails(this.routerId, this.token, this.region, this.asyncHandler.bind(undefined, callback), this.query);
  },
  __security_groupDetail: function (callback) {
    this.neutron.security.showSecurityDetails(this.projectId, this.securityId, this.token, this.region, this.asyncHandler.bind(undefined, callback), this.query);
  },
  __subnetDetail: function (callback) {
    this.neutron.subnet.showSubnetDetails(this.subnetId, this.token, this.region, this.asyncHandler.bind(undefined, callback), this.query);
  },
  __novaQuotaUpdate: function (callback) {
    this.nova.quota.updateQuota(this.projectId, this.targetId, this.token, this.region, this.asyncHandler.bind(undefined, callback), {'quota_set': this.novaBody});
  },
  __cinderQuotaUpdate: function (callback) {
    this.cinder.quota.updateQuota(this.projectId, this.targetId, this.token, this.region, this.asyncHandler.bind(undefined, callback), {'quota_set': this.cinderBody});
  },
  __neutronQuotaUpdate: function (callback) {
    this.neutron.quota.updateQuota(this.projectId, this.targetId, this.token, this.region, this.asyncHandler.bind(undefined, callback), {'quota': this.neutronBody});
  }
};
API.prototype.handleError = function (err, req, res, next) {
  if (err.status) {
    next(err);
  } else {
    if (err.code && err.code === 'ECONNREFUSED' && err.port) {
      let errorMsg = req.i18n.__('shared.out_of_service');
      switch (err.port) {
        case 8774:
          err.message = 'Nova ' + errorMsg;
          break;
        case 5000:
          err.message = 'Keystone ' + errorMsg;
          break;
        case 8776:
          err.message = 'Cinder ' + errorMsg;
          break;
        case 9696:
          err.message = 'Neutron ' + errorMsg;
          break;
        case 9292:
          err.message = 'Glance ' + errorMsg;
          break;
        default:
          err.message = errorMsg;
      }
      next(err);
    } else {
      res.status(500).send(err);
    }
  }
};
API.prototype.asyncHandler = function (callback, err, payload) {
  if (err) {
    callback(err);
  } else {
    callback(null, payload.body);
  }
};
API.prototype.orderByCreatedTime = function (arr, flag) {
  // default is DESC.
  if (!arr.length) {
    return;
  }
  if (flag === undefined) {
    flag = 'DESC';
  }
  if (['ASC', 'DESC'].indexOf(flag) === -1) {
    throw new Error('parameter flag must be ASC or DESC.');
  } else {
    let comparision = '';
    let pool = ['created', 'created_at'];
    pool.some(function (k) {
      return (arr[0][k] !== undefined) && (comparision = k);
    });
    if (!comparision) {
      return;
    } else {
      arr.sort(function (a, b) {
        return (new Date(b[comparision]) - new Date(a[comparision]));
      });
      if (flag === 'ASC') {
        arr.reverse();
      }
    }
  }
};
API.prototype.__initRoutes = function (callback) {
  callback();
  if (this.addRoutes) {
    this.addRoutes(this.app);
  }
};
API.prototype.getVars = function (req, arr) {
  this.token = req.session.user.token;
  this.region = req.headers.region;
  this.query = req.query;
  if (arr) {
    arr.forEach( e => {
      this[e] = req.params[e];
    });
  }
};
module.exports = API;
