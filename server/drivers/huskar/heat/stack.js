'use strict';

const Base = require('../base.js');
const driver = new Base();
const async = require('async');
const hostname = require('os').hostname();

module.exports = driver;

const base = require('./types.json');

function getStackName() {
  return 'stack-' + hostname + '-' + new Date().getTime();
}

function Stack(stack, projectId, token, remote, _driver) {
  if ( !(this instanceof Stack) ) {
    return new Stack(stack, projectId, token, remote, _driver);
  }
  this.count = 0;
  this.driver = _driver;
  this.theBind = Array.from(stack.bind || []);
  this.theCreate = Array.from(stack.create || []);
  this.theResize = Array.from(stack.resize || []);
  this.theDestroy = Array.from(stack.destroy || []);

  this.listApiCall = [];
  this.token = token;
  this.remote = remote;
  this.projectId = projectId;

  this.rsc = {};
  this.objCreate = {};
  this.template = {
    heat_template_version : '2015-04-30',
    description           : stack.description || 'There is no description.',
    resources             : this.rsc
  };
}

Stack.prototype.transform = function(baseTemplate, srcData) {
  let res = {
    type       : baseTemplate.type,
    properties : {}
  };
  Object.keys(srcData).forEach( s => {
    if (baseTemplate[s] !== undefined) {
      res.properties[s] = srcData[s];
    }
  });
  return res;
};

Stack.prototype.dealBind = function() {
  let newOne;
  this.theBind.forEach( e => {
    // deal with Instance
    if (typeof e.Instance === 'string') {
      // case New Instance
      newOne = this.objCreate['_' + e.Instance];
      if (newOne) {
        // since we use autoScaling API
        newOne = newOne.properties.resource || newOne;
        let nw = {};
        // port binding
        if (typeof e.Port === 'string') {
          // case New Port
          if (this.objCreate['_' + e.Port]) {
            nw.port = {get_resource: '_' + e.Port};
          } else {
          // case Old Port
            nw.port = e.Port;
          }
        }
        // Subnet binding
        if (typeof e.Subnet === 'string') {
          // case New Subnet
          if (this.objCreate['_' + e.Subnet]) {
            nw.subnet = {get_resource: '_' + e.Subnet};
          } else {
          // case Old Subnet
            nw.subnet = e.Subnet;
          }
        }
        // Network binding
        if (typeof e.Network === 'string') {
          // case New Network
          // there is no old one case, since Instance is attached to Subnet directly.
          if (this.objCreate['_' + e.Network]) {
            nw.network = {get_resource: '_' + e.Network};
          } else {
          // case Old Network
            nw.network = e.Network;
          }
        }
        // Floatingip binding
        if (typeof e.Floatingip === 'string') {
          // case New Floatingip
          // there is no old one case, since Instance is attached to Subnet directly.
          if (this.objCreate['_' + e.Floatingip]) {
            nw.floating_ip = {get_resource: '_' + e.Floatingip};
          } else {
            // case Old Floatingip
            nw.floating_ip = e.Floatingip;
          }
        }
        if (Object.keys(nw).length) {
          newOne.properties.networks = newOne.properties.networks || [];
          return newOne.properties.networks.push(nw);
        }
        // Volume binding
        if (typeof e.Volume === 'string') {
          newOne.properties.block_device_mapping_v2 = newOne.properties.block_device_mapping_v2 || [];
          if (this.objCreate['_' + e.Volume]) {
            newOne.properties.block_device_mapping_v2.push({volume_id: {get_resource: '_' + e.Volume}});
            return true;
          } else {
            newOne.properties.block_device_mapping_v2.push({volume_id: e.Volume});
            return true;
          }
        }
        if (typeof e.Keypair === 'string') {
          if (this.objCreate['_' + e.Keypair]) {
            newOne.properties.key_name = {get_resource: '_' + e.Keypair};
            return true;
          } else {
            newOne.properties.key_name = e.Volume;
            return true;
          }
        }
      } else {
        /* NA in first stage. */
      }
    }
  });
};

Stack.prototype.dealCreate = function() {
  this.theCreate.forEach( e => {
    if (undefined === base['create' + e._type]) {
      return true;
    }
    let srcData;
    if (typeof e._number === 'number' && e._number > 1) {
      srcData = {
        max_size: e._number,
        min_size: e._number,
        resource: this.transform(base['create' + e._type], e)
      };
      srcData = this.transform(base.autoScaling, srcData);
    } else {
      srcData = this.transform(base['create' + e._type], e);
    }
    if (e._identity) {
      this.objCreate['_' + e._identity] = srcData;
    } else {
      this.objCreate[e._type + '-' + this.count++] = srcData;
    }
  });
};

Stack.prototype.dealResize = function() {
  this.theResize.forEach( e => {
    switch(e._type) {
      case 'Instance': {
        /* {
         *   _type  : 'Instance',
         *   id     : '',
         *   flavor : ''
         * }
         */
        this.listApiCall.push(callback => {
          this.driver.ref.nova.server.resizeServer(this.projectId, e.id, e.flavor, this.token, this.remote.nova, callback);
        });
      } break;
      case 'Volume': {
        /* {
         *   _type : 'Volume',
         *   id    : '',
         *   size  : 1
         * }
         */
        this.listApiCall.push(callback => {
          this.driver.ref.cinder.volume.resizeVolume(this.projectId, e.id, e.size, this.token, this.remote.cinder, callback);
        });
      } break;
      case 'Floatingip': {
        /* {
         *   _type : 'Floatingip',
         *   id    : '',
         *   size  : 1
         * }
         */
        this.listApiCall.push(callback => {
          this.driver.ref.neutron.floatingip.resizeFloatingip(e.id, e.size, this.token, this.remote.neutron, callback);
        });
      } break;
      default:
    }
  });
};

Stack.prototype.dealDestroy = function() {
  this.theDestroy.forEach( e => {
    switch(e._type) {
      case 'Instance': {
        this.listApiCall.push(callback => {
          this.driver.ref.nova.server.destroyServer(e.id, this.token, this.remote.nova, callback);
        });
      } break;
      default:
    }
  });
};

Stack.prototype.callStack = function (callback) {
  return this.driver.postMethod(
    this.remote.heat + '/v1/' + this.projectId + '/stacks',
    this.token,
    callback,
    {
      disable_rollback: false,
      stack_name: getStackName(),
      template: this.template,
      timeout_mins: 60
    }
  );
};

Stack.prototype.render = function() {
  this.dealCreate();
  this.dealBind();
  this.dealResize();
  Object.assign(this.rsc, this.objCreate);
  return this;
};

// the token of whom can access the project
driver.createStack = function (stack, projectId, token, remote, callback) {
  if (undefined === stack) {
    return callback(new Error('stack is required.'));
  }
  let stk = new Stack(stack, projectId, token, remote, driver).render();
  return async.parallel([stk.callStack.bind(stk)].concat(stk.listApiCall), (err, results) => {
    if (err) {
      return callback(err);
    } else {
      results.forEach(e => {
        if (e.body && e.body.stack) {
          return callback(null, e.body);
        }
      });
      return callback(null, '');
    }
  });
};

driver.listStacks = function (projectId, token, remote, callback, query) {
  return driver.getMethod(
    remote + '/v1/' + projectId + '/stacks',
    token,
    callback,
    query
  );
};

// 下划线是自定义字段
/*let body = {
  description: 'this is a test template.',
  create: [
    {
      // 这个是资源的类型，必填
      _type      : 'Instance',
      // 这个是创建的数量，数量为1个时，可以不添加该字段
      _number : 10,
      // 这个字段是在资源不存在的情况下，绑定时用到的标志，可以是自定义的任意值，没有绑定关系时可以不添加该字段
      _identity  : 'ins1',
      name       : 'demo',
      flavor     : '213123-1231-sd-sd-sfsdsaddas',
      image      : '2163tyhsad7812e1-123sad-123',
      admin_pass : 'asdkhjsa',
    },
    {
      _type     : 'Network',
      _identity : 'net1',
      name      : 'demonet',
      pool      : '0e436feb-43f3-4d7d-b4be-581ed765ad01'
    }
  ],
  destroy : [],
  resize  : [],
  bind: [
    {
      _type: 'InstanceNetwork',
      Instance: 'ins1',
      Network: 'net1'
    }
  ]
};*/
