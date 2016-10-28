'use strict';

const async = require('async');
const Base = require('../base.js');

// due to Image is reserved word
function Image (app) {
  this.app = app;
  Base.call(this);
}

Image.prototype = {
  getImageList: function (req, res, next) {
    let objVar = this.getVars(req);
    let images;
    this.__images(objVar, (err, payload) => {
      if (err) {
        this.handleError(err, req, res, next);
      } else {
        images = payload.images;
        this.orderByCreatedTime(images);
        res.json({images: images});
      }
    });
  },
  getImageListByOwner: function (req, res, next) {
    let objVar = this.getVars(req);
    let images;
    this.__images(objVar, (err, payload) => {
      if (err) {
        this.handleError(err, req, res, next);
      } else {
        images = payload.images;
        images = images.filter(image => image.visibility === 'private' ? image.meta_owner === req.session.user.username : true);
        this.orderByCreatedTime(images);
        res.json({images: images});
      }
    });
  },
  getImageDetails: function (req, res, next) {
    let objVar = this.getVars(req, ['imageId']);
    this.__imageDetail(objVar, (err, payload) => {
      if (err) {
        res.status(err.status).json(err);
      } else {
        res.json({image: payload});
      }
    });
  },
  getInstanceSnapshotList: function (req, res, next) {
    let objVar = this.getVars(req);
    async.parallel([
      this.__images.bind(this, objVar)],
      (err, results) => {
        if (err) {
          this.handleError(err, req, res, next);
        } else {
          let images = results[0].images;
          let re = [];
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
    let objVar = this.getVars(req, ['imageId']);
    async.parallel([
      this.__imageDetail.bind(this, objVar)],
      (err, results) => {
        if (err) {
          this.handleError(err, req, res, next);
        } else {
          res.json({image: results[0]});
        }
      }
    );
  },
  updateImage: function (req, res, next) {
    let objVar = this.getVars(req, ['imageId']);
    objVar.payload = req.body;
    this.__updateImage(objVar, (err, data) => {
      if (err) {
        this.handleError(err, req, res, next);
      } else {
        res.json(data.text);
      }
    });
  },
  initRoutes: function () {
    return this.__initRoutes( () => {
      this.app.get('/api/v1/images', this.getImageList.bind(this));
      this.app.get('/api/v1/images/owner', this.getImageListByOwner.bind(this));
      this.app.get('/api/v1/images/:imageId', this.getImageDetails.bind(this));
      this.app.get('/api/v1/instanceSnapshots', this.getInstanceSnapshotList.bind(this));
      this.app.get('/api/v1/instanceSnapshots/:imageId', this.getInstanceSnapshotDetails.bind(this));
      this.app.patch('/api/v1/images/:imageId', this.updateImage.bind(this));
    });
  }
};

Object.assign(Image.prototype, Base.prototype);

module.exports = Image;
