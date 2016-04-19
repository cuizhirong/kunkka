'use strict';

var async = require('async');
var Base = require('../base.js');

// due to Image is reserved word
function Image (app) {
  this.app = app;
  this.arrService = ['glance'];
  this.arrServiceObject = [];
  Base.call(this, this.arrService, this.arrServiceObject);
}

Image.prototype = {
  getImageList: function (req, res, next) {
    this.getVars(req);
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
    this.getVars(req, ['imageId']);
    this.__imageDetail( (err, payload) => {
      if (err) {
        res.status(err.status).json(err);
      } else {
        res.json({image: payload});
      }
    });
  },
  getInstanceSnapshotList: function (req, res, next) {
    this.getVars(req);
    async.parallel([
      this.__images.bind(this)],
      (err, results) => {
        if (err) {
          this.handleError(err, req, res, next);
        } else {
          var images = results[0].images;
          var re = [];
          images.forEach( image => {
            if ( image.image_type === 'snapshot' ) {
              re.push(image);
            }
          });
          res.json({images: re});
        }
      }
    );
  },
  getInstanceSnapshotDetails: function (req, res, next) {
    this.getVars(req, ['imageId']);
    async.parallel([
      this.__imageDetail.bind(this)],
      (err, results) => {
        if (err) {
          this.handleError(err, req, res, next);
        } else {
          res.json({image: results[0]});
        }
      }
    );
  },
  initRoutes: function () {
    return this.__initRoutes( () => {
      this.app.get('/api/v1/images', this.getImageList.bind(this));
      this.app.get('/api/v1/images/:imageId', this.getImageDetails.bind(this));
      this.app.get('/api/v1/instanceSnapshots', this.getInstanceSnapshotList.bind(this));
      this.app.get('/api/v1/instanceSnapshots/:imageId', this.getInstanceSnapshotDetails.bind(this));
    });
  }
};

Object.assign(Image.prototype, Base.prototype);

module.exports = Image;
