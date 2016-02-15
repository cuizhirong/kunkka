function API () {

}

API.prototype.handleError = function (err, req, res, next) {
  if (err.status === 401) {
    next(err);
  } else {
    res.status(err.status).send(err);
  }
};

module.exports = API;
