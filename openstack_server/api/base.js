function API () {

}

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
API.prototype.paramChecker = function (service, action, req, res) {
  var meta = service.meta[action];
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
module.exports = API;
