'use strict';

const Base = require('../base.js');
const paginate = require('helpers/paginate.js');
const csv = require('json2csv');

// due to Host is reserved word
function Host(app) {
  this.app = app;
  Base.call(this);
}

Host.prototype = {
  getHostList: function(req, res, next) {
    /* set if use cache. */
    let useCache = false;
    let objVar = this.getVars(req, ['projectId']);
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
        let obj = paginate('hypervisors', JSON.parse(cache.toString()), '/api/v1/' + objVar.projectId + '/os-hypervisors/detail', objVar.query.page, objVar.query.limit);
        res.json({
          hypervisors: obj.hypervisors,
          hypervisors_links: obj.hypervisors_links
        });
        cache = null;
      } else {
        this.__hosts(objVar, (err, payload) => {
          if (err) {
            this.handleError(err, req, res, next);
          } else {
            let obj = paginate('hypervisors', payload.hypervisors, '/api/v1/' + objVar.projectId + '/os-hypervisors/detail', objVar.query.page, objVar.query.limit);

            if (useCache) {
              this.app.get('CacheClient').set('halo-os-hypervisors', JSON.stringify(obj.hypervisors), function() {}, 3600 * 24);
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
  getHostCSV: function(req, res, next) {
    req.headers.region = req.session.user.regionId;
    let objVar = this.getVars(req, ['projectId']);
    this.__hosts(objVar, (err, payload) => {
      if (err) {
        this.handleError(err, req, res, next);
      } else {
        let __ = req.i18n.__.bind(req.i18n);
        let fields = [{
          label: __('api.nova.memory'),
          value: row => (row.memory_mb_used / 1024).toFixed(2) + '/' + (row.memory_mb / 1024).toFixed(2)
        }, {
          label: __('api.nova.disk'),
          value: row => row.local_gb_used + '/' + row.local_gb
        }, {
          label: __('api.nova.vms'),
          value: 'running_vms'
        }, {
          label: 'IP',
          value: 'host_ip'
        }, {
          label: __('api.nova.status'),
          value: 'status'
        }, {
          label: 'State',
          value: 'state'
        }];
        res.setHeader('Content-Description', 'File Transfer');
        res.setHeader('Content-Type', 'application/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename=hosts.csv');
        res.setHeader('Expires', '0');
        res.setHeader('Cache-Control', 'must-revalidate');
        try {
          let output = csv({
            data: payload.hypervisors,
            fields: fields
          });
          res.send(output);
        } catch (e) {
          next(e);
        }
      }
    });
  },
  initRoutes: function() {
    return this.__initRoutes(() => {
      this.app.get('/api/v1/:projectId/os-hypervisors/detail', this.getHostList.bind(this));
      this.app.get('/api/v1/:projectId/os-hypervisors/csv', this.getHostCSV.bind(this));
    });
  }
};

Object.assign(Host.prototype, Base.prototype);

module.exports = Host;
