'use strict';

var Base = require('../../base.js');

// due to Image is reserved word
function Image (app) {
  this.app = app;
  this.arrService = ['glance'];
  this.arrServiceObject = [];
  Base.call(this, this.arrService, this.arrServiceObject);
}

Image.prototype = {
  getImageList: function (req, res, next) {
    this.region = req.headers.region;
    this.token = req.session.user.token;
    this.__images( (err, payload) => {
      if (err) {
        this.handleError(err, req, res, next);
      } else {
        var images = payload.images;
        this.orderByCreatedTime(images);
        res.json({images: images});
      }
    });
  },
  getImageDetails: function (req, res, next) {
    this.imageId = req.params.imageId;
    this.token = req.session.user.token;
    this.region = req.headers.region;
    this.__imageDetail( (err, payload) => {
      if (err) {
        res.status(err.status).json(err);
      } else {
        res.json({image: payload});
      }
    });
  },
  initRoutes: function () {
    return this.__initRoutes( () => {
      this.app.get('/api/v1/images', this.getImageList.bind(this));
      this.app.get('/api/v1/images/:imageId', this.getImageDetails.bind(this));
    });
  }
};

module.exports = function (app, extension) {
  Object.assign(Image.prototype, Base.prototype);
  if (extension) {
    Object.assign(Image.prototype, extension);
  }
  var image = new Image(app);
  image.initRoutes();
};
