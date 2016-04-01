'use strict';

var Driver = require('openstack_server/drivers');
var Glance = Driver.glance;
var Base = require('openstack_server/api/base.js');

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
    this.glance.image.listImages(token, region, function (err, payload) {
      if (err) {
        that.handleError(err, req, res, next);
      } else {
        var images = payload.body.images;
        that.orderByCreatedTime(images);
        res.json({images: images});
      }
    }, req.query);
  },
  getImageDetails: function (req, res, next) {
    var imageId = req.params.imageId;
    var token = req.session.user.token;
    var region = req.headers.region;
    this.glance.image.showImageDetails(imageId, token, region, function (err, payload) {
      if (err) {
        res.status(err.status).json(err);
      } else {
        res.json(payload.body);
      }
    });
  },
  initRoutes: function () {
    this.app.get('/api/v1/images', this.getImageList.bind(this));
    this.app.get('/api/v1/images/:imageId', this.getImageDetails.bind(this));
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
