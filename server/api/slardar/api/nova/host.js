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
    /* set if use cache. */
    let useCache = false;
    this.getVars(req, ['projectId']);
    this.__cacheItem = (item, callback) => {
      if (useCache) {
        this.app.get('CacheClient').get(item, callback);
      } else {
        /* no cache, no error. */
        callback(null, null);
      }
    };
    this.__cacheItem('halo-os-hypervisors', (error, cache) => {
      if (error) {
        /* nothing currently. */
      } else if (cache) {
        let obj = paginate('hypervisors', JSON.parse(cache.toString()), '/api/v1/' + this.projectId + '/os-hypervisors/detail', this.query.page, this.query.limit);
        res.json({
          hypervisors: obj.hypervisors,
          hypervisors_links: obj.hypervisors_links
        });
        cache = null;
      } else {
        this.__hosts( (err, payload) => {
          if (err) {
            this.handleError(err, req, res, next);
          } else {
            let obj = paginate('hypervisors', payload.hypervisors, '/api/v1/' + this.projectId + '/os-hypervisors/detail', this.query.page, this.query.limit);

            if (useCache) {
              this.app.get('CacheClient').set('halo-os-hypervisors', JSON.stringify(obj.hypervisors), function () {
              }, 3600 * 24);
            }

            res.json({
              hypervisors: obj.hypervisors,
              hypervisors_links: obj.hypervisors_links
            });
            payload = null;
          }
        });
      }
    });
  },
  initRoutes: function () {
    return this.__initRoutes( () => {
      this.app.get('/api/v1/:projectId/os-hypervisors/detail', this.getHostList.bind(this));
    });
  }
};

Object.assign(Host.prototype, Base.prototype);

module.exports = Host;
