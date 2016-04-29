'use strict';

const Base = require('../base.js');
const paginate = require('helpers/paginate.js');

// due to Project is reserved word
function Project (app) {
  this.app = app;
  Base.call(this);
}

Project.prototype = {
  getProjectList: function (req, res, next) {
    let objVar = this.getVars(req);
    this.__projects(objVar, (err, payload) => {
      if (err) {
        this.handleError(err, req, res, next);
      } else {
        let obj = paginate('projects', payload.projects, '/api/v1/projects', objVar.query.page, objVar.query.limit);
        res.json({
          projects: obj.projects,
          projects_links: obj.projects_links
        });
        payload = null;
      }
    });
  },
  initRoutes: function () {
    return this.__initRoutes( () => {
      this.app.get('/api/v1/projects', this.getProjectList.bind(this));
    });
  }
};

Object.assign(Project.prototype, Base.prototype);

module.exports = Project;
