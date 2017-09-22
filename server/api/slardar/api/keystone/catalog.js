'use strict';
const region = require('config')('region');
const adminLogin = require('../../common/adminLogin');
const Base = require('../base');
// due to Project is reserved word
function Catalog (app) {
  this.app = app;
  Base.call(app);
}

Catalog.prototype = {
  getServices: function (req, res, next) {
    adminLogin((err, result) => {
      if (err) {
        next(err);
      } else {
        let catalog = (result && result.response && result.response.body && result.response.body.token && result.response.body.token.catalog) || [];
        res.json({
          region,
          catalog
        });
      }
    });
  },
  initRoutes: function () {
    return this.__initRoutes( () => {
      this.app.get('/api/v1/services', this.getServices.bind(this));
    });
  }
};

Object.assign(Catalog.prototype, Base.prototype);
module.exports = Catalog;
