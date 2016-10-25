'use strict';

const driver = require('server/drivers');
const keystoneRemote = require('config')('keystone');

function asyncHandler(callback, err, payload) {
  if (err) {
    callback(err);
  } else {
    callback(null, payload.body);
  }
}

function asyncHandlerOrigin(callback, err, payload) {
  if (err) {
    callback(err);
  } else {
    callback(null, payload);
  }
}

function API (arrServiceObject) {
  /* get methods of show serviceObject list. */
  if (arrServiceObject) {
    this.arrAsync = (objVar) => {
      let list = [];
      arrServiceObject.forEach( s => list.push(this['__' + s].bind(this, objVar)) );
      return list;
    };
  }
}

function getImageListRecursive (objVar, remote, link, images, callback) {
  let marker = link.split('=')[1];
  objVar.query.marker = marker;
  driver.glance.image.listImages(objVar.token, remote, (err, payload) => {
    if (err) {
      callback(err);
    } else {
      const result = payload.body;
      images = images.concat(result.images);
      if (result.next) {
        images = images.concat(result.images);
        getImageListRecursive(objVar, remote, result.next, images, callback);
      } else {
        callback(null, {images});
      }
    }
  }, objVar.query);
}

API.prototype = {
  // keystone:
  __unscopedAuth: function (objVar, callback) {
    driver.keystone.authAndToken.unscopedAuth(objVar.username, objVar.password, objVar.domain, keystoneRemote, asyncHandlerOrigin.bind(undefined, callback));
  },
  __scopedAuth: function (objVar, callback) {
    driver.keystone.authAndToken.scopedAuth(objVar.projectId, objVar.token, keystoneRemote, asyncHandlerOrigin.bind(undefined, callback));
  },
  __userProjects: function (objVar, callback) {
    driver.keystone.project.getUserProjects(objVar.userId, objVar.token, keystoneRemote, asyncHandler.bind(undefined, callback));
  },
  __projects: function (objVar, callback) {
    driver.keystone.project.listProjects(objVar.token, keystoneRemote, asyncHandler.bind(undefined, callback), objVar.query);
  },
  __users: function (objVar, callback) {
    driver.keystone.user.listUsers(objVar.token, keystoneRemote, asyncHandler.bind(undefined, callback), objVar.query);
  },
  __joinProject: function (objVar, callback) {
    driver.keystone.role.addRoleToUserOnProject(objVar.projectId, objVar.userId, objVar.roleId, objVar.token, keystoneRemote, asyncHandler.bind(undefined, callback));
  },
  __roles: function (objVar, callback) {
    driver.keystone.role.listRoles(objVar.token, keystoneRemote, asyncHandler.bind(undefined, callback), objVar.query);
  },
  __checkRole: function (objVar, callback) {
    driver.keystone.role.checkRole(objVar.projectId, objVar.userId, objVar.roleId, objVar.token, keystoneRemote, asyncHandler.bind(undefined, callback));
  },

  // nova:
  __hosts: function (objVar, callback) {
    let remote = objVar.endpoint.nova[objVar.region];
    driver.nova.host.listHosts(objVar.projectId, objVar.token, remote, asyncHandler.bind(undefined, callback), objVar.query);
  },
  __servers: function (objVar, callback) {
    let remote = objVar.endpoint.nova[objVar.region];
    driver.nova.server.listServers(objVar.projectId, objVar.token, remote, asyncHandler.bind(undefined, callback), objVar.query);
  },
  __flavors: function (objVar, callback) {
    let remote = objVar.endpoint.nova[objVar.region];
    driver.nova.flavor.listFlavors(objVar.projectId, objVar.token, remote, asyncHandler.bind(undefined, callback), objVar.query);
  },
  __keypairs: function (objVar, callback) {
    let remote = objVar.endpoint.nova[objVar.region];
    driver.nova.keypair.listKeypairs(objVar.projectId, objVar.token, remote, asyncHandler.bind(undefined, callback), objVar.query);
  },
  __novaQuota: function (objVar, callback) {
    let remote = objVar.endpoint.nova[objVar.region];
    driver.nova.quota.getQuota(objVar.projectId, objVar.targetId, objVar.token, remote, asyncHandler.bind(undefined, callback), objVar.query);
  },
  __serverDetail: function (objVar, callback) {
    let remote = objVar.endpoint.nova[objVar.region];
    driver.nova.server.showServerDetails(objVar.projectId, objVar.serverId, objVar.token, remote, asyncHandler.bind(undefined, callback), objVar.query);
  },
  __novaQuotaUpdate: function (objVar, callback) {
    let remote = objVar.endpoint.nova[objVar.region];
    driver.nova.quota.updateQuota(objVar.projectId, objVar.targetId, objVar.token, remote, asyncHandler.bind(undefined, callback), {'quota_set': objVar.novaBody});
  },

  // cinder:
  __volumes: function (objVar, callback) {
    let remote = objVar.endpoint.cinder[objVar.region];
    driver.cinder.volume.listVolumes(objVar.projectId, objVar.token, remote, asyncHandler.bind(undefined, callback), objVar.query);
  },
  __volumeTypes: function (objVar, callback) {
    let remote = objVar.endpoint.cinder[objVar.region];
    driver.cinder.volume.listVolumeTypes(objVar.projectId, objVar.token, remote, asyncHandler.bind(undefined, callback), objVar.query);
  },
  __snapshots: function (objVar, callback) {
    let remote = objVar.endpoint.cinder[objVar.region];
    driver.cinder.snapshot.listSnapshots(objVar.projectId, objVar.token, remote, asyncHandler.bind(undefined, callback), objVar.query);
  },
  __cinderQuota: function (objVar, callback) {
    let remote = objVar.endpoint.cinder[objVar.region];
    driver.cinder.quota.getQuota(objVar.projectId, objVar.targetId, objVar.token, remote, asyncHandler.bind(undefined, callback), {'usage': 'True'});
  },
  __volumeDetail: function (objVar, callback) {
    let remote = objVar.endpoint.cinder[objVar.region];
    driver.cinder.volume.showVolumeDetails(objVar.projectId, objVar.volumeId, objVar.token, remote, asyncHandler.bind(undefined, callback), objVar.query);
  },
  __snapshotDetail: function (objVar, callback) {
    let remote = objVar.endpoint.cinder[objVar.region];
    driver.cinder.snapshot.showSnapshotDetails(objVar.projectId, objVar.snapshotId, objVar.token, remote, asyncHandler.bind(undefined, callback), objVar.query);
  },
  __cinderQuotaUpdate: function (objVar, callback) {
    let remote = objVar.endpoint.cinder[objVar.region];
    driver.cinder.quota.updateQuota(objVar.projectId, objVar.targetId, objVar.token, remote, asyncHandler.bind(undefined, callback), {'quota_set': objVar.cinderBody});
  },

  // glance:
  __images: function (objVar, callback) {
    let remote = objVar.endpoint.glance[objVar.region];
    let images = [];
    driver.glance.image.listImages(objVar.token, remote, (err, payload) => {
      if (err) {
        callback(err);
      } else {
        const result = payload.body;
        if (result.next) {
          images = images.concat(result.images);
          getImageListRecursive(objVar, remote, result.next, images, callback);
        } else {
          callback(null, {images});
        }
      }
    }, objVar.query);
  },
  __imageDetail: function (objVar, callback) {
    let remote = objVar.endpoint.glance[objVar.region];
    driver.glance.image.showImageDetails(objVar.imageId, objVar.token, remote, asyncHandler.bind(undefined, callback), objVar.query);
  },

  // neutron:
  __floatingips: function (objVar, callback) {
    let remote = objVar.endpoint.neutron[objVar.region];
    driver.neutron.floatingip.listFloatingips(objVar.token, remote, asyncHandler.bind(undefined, callback), objVar.query);
  },
  __networks: function (objVar, callback) {
    let remote = objVar.endpoint.neutron[objVar.region];
    driver.neutron.network.listNetworks(objVar.token, remote, asyncHandler.bind(undefined, callback), objVar.query);
  },
  __externalNetworks: function (objVar, callback) {
    let remote = objVar.endpoint.neutron[objVar.region];
    driver.neutron.network.listExternalNetworks(objVar.token, remote, asyncHandler.bind(undefined, callback));
  },
  __sharedNetworks: function (objVar, callback) {
    let remote = objVar.endpoint.neutron[objVar.region];
    driver.neutron.network.listSharedNetworks(objVar.token, remote, asyncHandler.bind(undefined, callback));
  },
  __ports: function (objVar, callback) {
    let remote = objVar.endpoint.neutron[objVar.region];
    driver.neutron.port.listPorts(objVar.token, remote, asyncHandler.bind(undefined, callback), objVar.query);
  },
  __routers: function (objVar, callback) {
    let remote = objVar.endpoint.neutron[objVar.region];
    driver.neutron.router.listRouters(objVar.token, remote, asyncHandler.bind(undefined, callback), objVar.query);
  },
  __security_groups: function (objVar, callback) {
    let remote = objVar.endpoint.neutron[objVar.region];
    driver.neutron.security.listSecurity(objVar.projectId, objVar.token, remote, asyncHandler.bind(undefined, callback), objVar.query);
  },
  __subnets: function (objVar, callback) {
    let remote = objVar.endpoint.neutron[objVar.region];
    driver.neutron.subnet.listSubnets(objVar.token, remote, asyncHandler.bind(undefined, callback), objVar.query);
  },
  __neutronQuota: function (objVar, callback) {
    let remote = objVar.endpoint.neutron[objVar.region];
    driver.neutron.quota.getQuota(objVar.projectId, objVar.targetId, objVar.token, remote, asyncHandler.bind(undefined, callback), objVar.query);
  },
  __floatingipDetail: function (objVar, callback) {
    let remote = objVar.endpoint.neutron[objVar.region];
    driver.neutron.floatingip.showFloatingipDetails(objVar.floatingipId, objVar.token, remote, asyncHandler.bind(undefined, callback), objVar.query);
  },
  __networkDetail: function (objVar, callback) {
    let remote = objVar.endpoint.neutron[objVar.region];
    driver.neutron.network.showNetworkDetails(objVar.networkId, objVar.token, remote, asyncHandler.bind(undefined, callback), objVar.query);
  },
  __portDetail: function (objVar, callback) {
    let remote = objVar.endpoint.neutron[objVar.region];
    driver.neutron.port.showPortDetails(objVar.portId, objVar.token, remote, asyncHandler.bind(undefined, callback), objVar.query);
  },
  __routerDetail: function (objVar, callback) {
    let remote = objVar.endpoint.neutron[objVar.region];
    driver.neutron.router.showRouterDetails(objVar.routerId, objVar.token, remote, asyncHandler.bind(undefined, callback), objVar.query);
  },
  __security_groupDetail: function (objVar, callback) {
    let remote = objVar.endpoint.neutron[objVar.region];
    driver.neutron.security.showSecurityDetails(objVar.projectId, objVar.securityId, objVar.token, remote, asyncHandler.bind(undefined, callback), objVar.query);
  },
  __subnetDetail: function (objVar, callback) {
    let remote = objVar.endpoint.neutron[objVar.region];
    driver.neutron.subnet.showSubnetDetails(objVar.subnetId, objVar.token, remote, asyncHandler.bind(undefined, callback), objVar.query);
  },
  __neutronQuotaUpdate: function (objVar, callback) {
    let remote = objVar.endpoint.neutron[objVar.region];
    driver.neutron.quota.updateQuota(objVar.projectId, objVar.targetId, objVar.token, remote, asyncHandler.bind(undefined, callback), {'quota': objVar.neutronBody});
  },
  __getVNCConsole: function (objVar, callback) {
    let remote = objVar.endpoint.nova[objVar.region];
    driver.nova.server.getVNCConsole(objVar.projectId, objVar.serverId, objVar.token, remote, asyncHandler.bind(undefined, callback), {'os-getVNCConsole': {'type': 'novnc'}});
  },
  __updateImage: function (objVar, callback) {
    let remote = objVar.endpoint.glance[objVar.region];
    driver.glance.image.updateImage(objVar.imageId, objVar.payload, objVar.token, remote, callback);
  },

  // heat:
  __createStack: function (objVar, callback) {
    let remote = {
      heat: objVar.endpoint.heat[objVar.region],
      nova: objVar.endpoint.nova[objVar.region],
      cinder: objVar.endpoint.cinder[objVar.region],
      neutron: objVar.endpoint.neutron[objVar.region],
      glance: objVar.endpoint.glance[objVar.region],
      keystone: objVar.endpoint.keystone[objVar.region]
    };
    driver.heat.stack.createStack(objVar.stack, objVar.projectId, objVar.token, remote, callback);
  },
  __stacks: function (objVar, callback) {
    let remote = objVar.endpoint.heat[objVar.region];
    driver.heat.stack.listStacks(objVar.projectId, objVar.token, remote, callback, objVar.query);
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
      res.status(500).send(err.message || err);
    }
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

API.prototype.getVars = function (req, extra) {
  let objVar = {
    token: req.session.user.token,
    endpoint: req.session.endpoint,
    region: req.headers.region,
    query: req.query
  };
  /* general user to delete tenant_id. */
  if (!req.session.user.isAdmin && objVar.query.tenant_id) {
    delete objVar.query.tenant_id;
  }
  if (extra) {
    extra.forEach( e => {
      objVar[e] = req.params[e];
    });
  }
  return objVar;
};

API.prototype.deduplicate = function (list) {
  let tmpObj = {};
  let tmpArr = [];
  list.forEach( s => {
    tmpObj[s.id] = s;
  });
  Object.keys(tmpObj).forEach( s => {
    tmpArr.push(tmpObj[s]);
  });
  return tmpArr;
};

API.prototype.routerTypes = ['network:router_interface', 'network:router_interface_distributed'];

module.exports = API;
