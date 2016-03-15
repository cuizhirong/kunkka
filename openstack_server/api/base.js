var Driver = require('openstack_server/drivers');

function API (arrService, arrServiceObject) {
  this.arrAsync = [];
  /* get services. */
  arrService.forEach( s => this[s] = Driver[s] );
  /* get methods of show serviceObject list. */
  arrServiceObject.forEach( s => this.arrAsync.push(this.apilist[s].bind(this)) );
}

API.prototype.apilist = {
  servers: function (callback) {
    this.nova.server.listServers(this.projectId, this.token, this.region, this.asyncHandler.bind(this, callback));
  },
  flavors: function (callback) {
    this.nova.flavor.listFlavors(this.projectId, this.token, this.region, this.asyncHandler.bind(this, callback));
  },
  keypairs: function (callback) {
    this.nova.keypair.listKeypairs(this.projectId, this.token, this.region, this.asyncHandler.bind(this, callback));
  },
  volumes: function (callback) {
    this.cinder.volume.listVolumes(this.projectId, this.token, this.region, this.asyncHandler.bind(this, callback));
  },
  volumeTypes: function (callback) {
    this.cinder.volume.listVolumeTypes(this.projectId, this.token, this.region, this.asyncHandler.bind(this, callback));
  },
  snapshots: function (callback) {
    this.cinder.snapshot.listSnapshots(this.projectId, this.token, this.region, this.asyncHandler.bind(this, callback));
  },
  floatingips: function (callback) {
    this.neutron.floatingip.listFloatingips(this.token, this.region, this.asyncHandler.bind(this, callback));
  },
  networks: function (callback) {
    this.neutron.network.listNetworks(this.token, this.region, this.asyncHandler.bind(this, callback), this.reqQuery);
  },
  ports: function (callback) {
    this.neutron.port.listPorts(this.token, this.region, this.asyncHandler.bind(this, callback));
  },
  routers: function (callback) {
    this.neutron.router.listRouters(this.token, this.region, this.asyncHandler.bind(this, callback));
  },
  security_groups: function (callback) {
    this.neutron.security.listSecurity(this.projectId, this.token, this.region, this.asyncHandler.bind(this, callback));
  },
  subnets: function (callback) {
    this.neutron.subnet.listSubnets(this.token, this.region, this.asyncHandler.bind(this, callback));
  },
  images: function (callback) {
    this.glance.image.listImages(this.token, this.region, this.asyncHandler.bind(this, callback));
  },
  novaQuota: function (callback) {
    this.nova.quota.getQuota(this.projectId, this.token, this.region, this.asyncHandler.bind(this, callback));
  },
  cinderQuota: function (callback) {
    this.cinder.quota.getQuota(this.projectId, this.token, this.region, this.asyncHandler.bind(this, callback));
  },
  neutronQuota: function (callback) {
    this.neutron.quota.getQuota(this.projectId, this.token, this.region, this.asyncHandler.bind(this, callback));
  },
  serverDetail: function (callback) {
    this.nova.server.showServerDetails(this.projectId, this.serverId, this.token, this.region, this.asyncHandler.bind(this, callback));
  },
  volumeDetail: function (callback) {
    this.cinder.volume.showVolumeDetails(this.projectId, this.volumeId, this.token, this.region, this.asyncHandler.bind(this, callback));
  }
};
API.prototype.dicApiUrlParam = {
  'projectId'    : 'project_id',
  'serverId'     : 'server_id',
  'volumeId'     : 'volume_id',
  'snapshotId'   : 'snapshot_id',
  'networkId'    : 'network_id',
  'subnetId'     : 'subnet_id',
  'portId'       : 'port_id',
  'routerId'     : 'router_id',
  'floatingipId' : 'floatingip_id',
  'imageId'      : 'image_id',
  'securityId'   : 'security_id',
  'keypairName'  : 'keypair_name'
};
API.prototype.handleError = function (err, req, res, next) {
  if (err.status) {
    next(err);
  } else {
    if (err.code && err.code === 'ECONNREFUSED' && err.port) {
      var errorMsg = req.i18n.__('shared.out_of_service');
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
API.prototype.paramChecker = function (objService, action, req, res) {
  var meta = objService.metadata[action];
  var paramPool = meta.required.concat(meta.optional, meta.oneOf);
  var arrMiss = [];
  var objExtra = {};
  var hasOneof = true;
  var paramObj = {};
  if (meta.oneOf.length) {
    hasOneof = false;
  }
  Object.keys(req.body).forEach(function(k) {
    if (paramPool.indexOf(k) === -1) {
      objExtra[k] = req.body[k];
    } else {
      paramObj[k] = req.body[k];
    }
    if (meta.oneOf.indexOf(k) !== -1) {
      hasOneof = true;
    }
  });
  meta.required.forEach(function(r) {
    if (paramObj[r] === undefined) {
      arrMiss.push(r);
    }
  });
  if (arrMiss.length) {
    return res.status(400).json({'error': req.i18n.__('shared.error_parameters_required') + arrMiss});
  } else if (!hasOneof) {
    return res.status(400).json({'error': req.i18n.__('shared.error_parameters_oneof') + meta.oneOf});
  } else {
    return paramObj;
  }
};
API.prototype.generateActionApi = function (metadata, handler) {
  var that = this;
  var api = {};
  var method = 'post';
  var _handler = handler ? handler : this.operate;
  Object.keys(metadata).forEach(function (action) {
    api = metadata[action];
    method = api.method ? api.method : 'post';
    that.app[method](api.apiDir + api.type, _handler.bind(that, action));
  });
};
API.prototype.originalOperate = function (service, action, req, res, next) {
  var that = this;
  var token = req.session.user.token;
  var region = req.headers.region;
  var paramObj = this.paramChecker(service, action, req, res);
  Object.keys(this.dicApiUrlParam).forEach(function (e) {
    if (req.params[e]) {
      paramObj[that.dicApiUrlParam[e]] = req.params[e];
    }
  });
  service.action(token, region, function (err, payload) {
    if (err) {
      that.handleError(err, req, res, next);
    } else {
      res.json(payload.body);
    }
  }, action, paramObj);
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
    var comparision = '';
    var pool = ['created', 'created_at'];
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
module.exports = API;
