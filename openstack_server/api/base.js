function API () {

}

API.prototype.handleError = function (err, req, res, next) {
  if (err.status === 401) {
    next(err);
  } else {
    res.status(err.status).send(err);
  }
};
API.prototype.asyncHandler = function (callback, err, payload) {
  if (err) {
    callback(err);
  } else {
    callback(null, payload.body);
  }
};
module.exports = API;
