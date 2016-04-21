'use strict';

const Base = require('../base.js');
const paginate = require('helpers/paginate.js');

// due to Host is reserved word
function Host (app) {
  this.app = app;
  this.arrService = ['nova'];
  this.arrServiceObject = [];
  Base.call(this, this.arrService, this.arrServiceObject);
}

Host.prototype = {
  getHostList: function (req, res, next) {
    this.getVars(req, ['projectId']);
    this.__hosts( (err, payload) => {
      if (err) {
        this.handleError(err, req, res, next);
      } else {
        let obj = paginate('hypervisors', payload.hypervisors, '/api/v1/hypervisors', this.query.page, this.query.limit);
        res.json({
          hypervisors: obj.hypervisors,
          hypervisors_links: obj.hypervisors_links
        });
        payload = null;
      }
    });
  },
  initRoutes: function () {
    return this.__initRoutes( () => {
      this.app.get('/api/v1/:projectId/hypervisors/detail', this.getHostList.bind(this));
    });
  }
};

Object.assign(Host.prototype, Base.prototype);

module.exports = Host;
