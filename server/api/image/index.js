//var async = require('async');
var extend = require('extend');
var Glance = require('glance');

// due to Image is reserved word
function IMAGE (app, glance) {
  this.app = app;
  this.glance = glance;
}

var prototype = {
  getImageList: function (req, res, next) {
    var region = req.headers.region;
    var token = req.session.user.token;
    this.glance.listImages(token, region, function (err, payload) {
      if (err) {
        res.status(err.status).json(err);
      } else {
        res.json(payload.body);
      }
    });
  },
  getImageDetail: function (req, res, next) {
    var imageId = req.params.id;
    var token = req.session.user.token;
    var region = req.headers.region;
    this.glance.showImageDetail(imageId, token, region, function (err, payload) {
      if (err) {
        res.status(err.status).json(err);
      } else {
        res.json(payload.body);
      }
    });
  },
  initRoutes: function () {
    this.app.get('/api/v1/images', this.getImageList.bind(this));
    this.app.get('/api/v1/images/:id', this.getImageDetail.bind(this));
  }
};

module.exports = function (app, extension) {
  extend(IMAGE.prototype, prototype);
  if (extension) {
    extend(IMAGE.prototype, extension);
  }
  var image = new IMAGE(app, Glance);
  image.initRoutes();
};
