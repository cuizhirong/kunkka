var request = require('superagent');
var metadata = require('openstack_server/actionMetadata');

function Driver(service) {
  if (metadata[service]) {
    this.metadata = metadata[service];
    this.generateMeta(this.metadata);
  }
}

var fillUrlWithValue = function (slugs, dir, obj) {
  Object.keys(obj).forEach(function (find) {
    var replace = obj[find];
    var reg = new RegExp('{' + slugs[find] + '}', 'g');
    dir = dir.replace(reg, replace);
  });
  return dir;
};

var makeQueryForGetMethod = function (query) {
  var str = '';
  if (query) {
    Object.keys(query).forEach(function (k) {
      if (str) {
        str += '&';
      }
      str += k + '=' + query[k];
    });
  }
  str = str ? ('?' + str) : '';
  return str;
};

Driver.prototype.slugs = metadata.slugs;

Driver.prototype.generateMeta = function (dicMeta) {
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

Driver.prototype.action = function (token, region, callback, action, objSend) {
  var meta = this.metadata[action];
  var host = meta.remote[region];
  var args = [host, meta, token, callback, objSend];
  return this.operation(...args);
};

Driver.prototype.getMethod = function (url, token, callback, query) {
  var search = makeQueryForGetMethod(query);
  request
    .get(url + search)
    .set('X-Auth-Token', token)
    .end(callback);
};

Driver.prototype.operation = function (host, meta, token, callback, objSend) {
  var obj = {
    meta  : meta,
    send  : '',
    reply : {
      error : ''
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
    var dir = fillUrlWithValue(this.slugs, obj.meta.dir, objUrlParam);
    if (obj.meta.method === 'del' || obj.meta.method === 'delete') {
      request.del(host + dir)
        .set('X-Auth-Token', token)
        .end(callback);
    } else {
      request[obj.meta.method](host + dir)
        .send(obj.send)
        .set('X-Auth-Token', token)
        .end(callback);
    }
  }
};

module.exports = Driver;
