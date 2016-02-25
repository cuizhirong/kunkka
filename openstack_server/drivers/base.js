var request = require('superagent');

function Driver() {

}

var dicUrl = {
  'tenant_id'   : 'project_id',
  'server_id'   : 'server_id',
  'volume_id'   : 'volume_id',
  'snapshot_id' : 'snapshot_id',
  'network_id'  : 'network_id',
  'subnet_id'   : 'subnet_id',
  'router_id'   : 'router_id'
};

var dirReplace = function (dir, obj) {
  Object.keys(dicUrl).forEach(function (find) {
    var replace = obj[dicUrl[find]];
    var reg = new RegExp('{' + find + '}', 'g');
    dir = dir.replace(reg, replace);
  });
  return dir;
};

Driver.prototype.generateDicMeta = function (dicMeta) {
  Object.keys(dicMeta).forEach(function (e) {
    if (e === 'default') {
      return;
    } else {
      var obj = JSON.parse(JSON.stringify(dicMeta.default));
      Object.assign(obj, dicMeta[e]);
      dicMeta[e] = obj;
    }
  });
};

Driver.prototype.operation = function (remote, meta, token, region, callback, action, objSend) {
  var obj = {
    meta: meta,
    send: '',
    reply: {
      error: ''
    }
  };
  // if objSend.reqParam.{urlParam} is existing, put it into objSend.urlParam.
  var objUrlParam = {};
  if (obj.meta.urlParam) {
    obj.meta.urlParam.forEach(function (e) {
      objUrlParam[e] = objSend[e];
      delete objSend[e];
    });
  }
  // mix reqParam to actionValue.
  if (obj.meta.actionValue && (typeof obj.meta.actionValue === 'object')) {
    Object.assign(obj.meta.actionValue, objSend);
  }
  // modify obj.send.
  obj.send = {};
  if (obj.meta.actionKey) {
    obj.send[obj.meta.actionKey] = obj.meta.actionValue;
  } else if (Object.keys(obj.meta.actionValue)) {
    obj.send = obj.meta.actionValue;
  }
  // send request with no errors.
  if (obj.reply.error) {
    return obj.reply;
  } else {
    var dir = dirReplace(obj.meta.dir, objUrlParam);
    if (obj.meta.method === 'del' || obj.meta.method === 'delete') {
      request.del(remote + dir)
        .set('X-Auth-Token', token)
        .end(callback);
    } else {
      request[obj.meta.method](remote + dir)
        .send(obj.send)
        .set('X-Auth-Token', token)
        .end(callback);
    }
  }
};

module.exports = new Driver();
