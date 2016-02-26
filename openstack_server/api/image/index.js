//var async = require('async');
var Glance = require('openstack_server/drivers/glance');
var Base = require('../base');

// due to Image is reserved word
function IMAGE (app, glance) {
  this.app = app;
  this.glance = glance;
}

var prototype = {
  getImageList: function (req, res, next) {
    var that = this;
    var region = req.headers.region;
    var token = req.session.user.token;
    this.glance.listImages(token, region, function (err, payload) {
      if (err) {
        that.handleError(err, req, res, next);
      } else {
        res.json(payload.body);
      }
    });
  },
  getImageDetails: function (req, res, next) {
    var imageId = req.params.imageId;
    var token = req.session.user.token;
    var region = req.headers.region;
    this.glance.showImageDetails(imageId, token, region, function (err, payload) {
      if (err) {
        res.status(err.status).json(err);
      } else {
        res.json(payload.body);
      }
    });
  },
  operate: function (action, req, res, next) {
    var that = this;
    var token = req.session.user.token;
    var region = req.headers.region;
    // check if params required are given, and remove unnecessary params.
    var paramObj = this.paramChecker(this.glance, action, req, res);
    if (req.params.imageId) {
      paramObj.image_id = req.params.imageId;
    }

    this.glance.action(token, region, function (err, payload) {
      if (err) {
        that.handleError(err, req, res, next);
      } else {
        res.json(payload.body);
      }
    }, action, paramObj);
  },
  initRoutes: function () {
    this.app.get('/api/v1/images', this.getImageList.bind(this));
    this.app.get('/api/v1/images/:imageId', this.getImageDetails.bind(this));
    this.app.post('/api/v1/images/action/create', this.operate.bind(this, 'create'));
    this.app.delete('/api/v1/images/:imageId/action/delete', this.operate.bind(this, 'delete'));
  }
};

module.exports = function (app, extension) {
  Object.assign(IMAGE.prototype, Base.prototype);
  Object.assign(IMAGE.prototype, prototype);
  if (extension) {
    Object.assign(IMAGE.prototype, extension);
  }
  var image = new IMAGE(app, Glance);
  image.initRoutes();
};
