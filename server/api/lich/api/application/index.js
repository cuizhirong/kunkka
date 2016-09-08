'use strict';

const dao = require('../../dao');
const Base = require('./../base');
const applicationDao = dao.application;
const flow = require('config')('approval_flow');//low->high
const flowReverse = JSON.parse(JSON.stringify(flow)).reverse();//high->low
const Promise = require('bluebird');
const stack = require('api/slardar/api/heat/stack');
const token = require('api/slardar/common/token');
const driver = require('server/drivers');


function Application (app) {
  Base.call(this);
  this.app = app;
}

Application.prototype = {
  createApplication: function (req, res, next) {
    if (!req.session.user || !Array.isArray(req.session.user.roles)) {
      return res.status(403).json({msg: req.i18n.__('api.application.limitedAuthority')});
    }
    let userId = req.session.user.userId;
    let description = req.body.description;
    let detail = JSON.stringify(req.body.detail);
    let status = 'pending';
    let username = req.session.user.username;
    let projectId = req.session.user.projectId;
    let projectName = '';
    let projects = req.session.user.projects;
    if (projects && Array.isArray(projects)) {
      projects.some(project=> {
        return (project.id === projectId ) && ( projectName = project.name);
      })
    }

    let currentRole = this._getCurrentRole(req.session.user.roles);

    if (!currentRole) {
      return res.status(403).json({msg: req.i18n.__('api.application.limitedAuthority')});
    }

    let approvers = flow.slice(flow.indexOf(currentRole) + 1);
    let _approvals = [];
    approvers.forEach(function (item, i) {
      _approvals.push({
        approverRole: item,
        status: 'unopened',
        level: i + 1
      });
    });

    if (_approvals.length) {
      _approvals[0].status = 'approving';
    }
    applicationDao.create({
      description: description,
      username: username,
      userId: userId,
      status: status,
      projectId: projectId,
      projectName: projectName,
      detail: detail,
      role: currentRole,
      approvals: _approvals
    }).then(res.json.bind(res), next);
  },
  approveApplication: function (req, res, next) {
    //status pass refused
    //explain: string

    let data = req.body;
    if (data.status !== 'pass' && data.status !== 'refused') {
      return next({msg: req.i18n.__('api.application.UnsupportedParameter') + ':status'});
    }


    const applicationId = req.params.applicationId;
    let currentRole = this._getCurrentRole(req.session.user.roles);

    if (!currentRole) {
      res.status(403).json({msg: req.i18n.__('api.application.limitedAuthority')});
    }

    applicationDao.findOneById(applicationId).then(apply => {
      apply.approvals.sort(function (x, y) {
        return x.level > y.level;
      });

      let approvals = apply.approvals;
      let currentIndex = -1;
      let hasApprove = approvals.some((approve, i) => {
        if (approve.approverRole === currentRole) {
          currentIndex = i;
          return true;
        }
      });
      if (!hasApprove) {
        return res.status(403).json({msg: req.i18n.__('api.application.limitedAuthority')});
      }

      if (approvals[currentIndex].status === 'pass' || approvals[currentIndex].status === 'refused') {
        return next({msg: req.i18n.__('api.application.hadBeenApproved')});
      } else if (approvals[currentIndex].status === 'unopened') {
        return next({msg: req.i18n.__('api.application.unopened')});
      } else if (approvals[currentIndex].status !== 'approving') {
        return next({msg: req.i18n.__('api.application.approvedError')});
      }

      approvals[currentIndex].status = data.status;
      approvals[currentIndex].explain = data.explain;
      approvals[currentIndex].username = req.session.user.username;
      approvals[currentIndex].userId = req.session.user.userId;
      apply.status = data.status;//pass,refused

      if (data.status === 'pass') {
        if (currentIndex === approvals.length - 1) {
          this.createResource(req, res, next, apply, approvals, currentIndex);
        } else {
          approvals[currentIndex + 1].status = 'approving';
          let arrSave = [
            apply.approvals[currentIndex].save(),
            apply.approvals[currentIndex + 1].save()
          ];
          if (apply.approvals[currentIndex].level === 1) {
            apply.status = 'approving';
            arrSave.push(apply.save());
          }
          Promise.all(arrSave).then(res.json.bind(res));
        }

      } else {// apply refused
        Promise.all([
          apply.approvals[currentIndex].save(),
          apply.save()
        ]).then(res.json.bind(res));
      }
    }).catch(next);
  },
  createResource: function(req, res, next, apply, approvals, currentIndex) {
    req.params.projectId = apply.projectId;
    let applyDetail = JSON.parse(apply.detail);
    if (applyDetail.type === 'direct') {
      this.directCreate(req, res, next, apply, applyDetail, function(e, d) {
        if (e) {
          next(e);
        } else if (d.resource) {
          apply.resourceId = d.resource.id;
          apply.resourceType = d.resourceType;
          Promise.all([
            approvals[currentIndex].save(),
            apply.save()
          ]).then(function () {
            res.json(apply);
          });
        } else {
          res.json(apply);
        }
      });
    } else {
      req.body.stack = applyDetail;
      stack.prototype.createStack(req, function(e, d) {
        if (e) {
          next(e);
        } else if (d.stack) {
          apply.stackId = d.stack.id;
          apply.stackHref = d.stack.links[0].href;
          Promise.all([
            approvals[currentIndex].save(),
            apply.save()
          ]).then(function () {
            res.json(apply);
          });
        } else {
          res.json(apply);
        }
      });
    }
  },
  directCreate: function (req, res, next, apply, applyDetail, callback) {
    let _token;
    token.prototype.adminGetOtherProjectToken(req, function(_err, data) {
      if (_err) {
        return callback(_err);
      } else {
        _token = data;
      }
      let region = req.headers.region;

      if (applyDetail.resourceType === 'network') {
        let remote = req.session.endpoint.neutron[region];
        if (applyDetail.create.length === 1) {
          let networkData = {network: applyDetail.create[0]};
          networkData = JSON.parse(JSON.stringify(networkData));
          delete networkData.network._type;
          delete networkData.network._identity;
          driver.neutron.network.createNetwork(_token, remote, networkData, function(err, net) {
            if (err) {
              callback(err);
            } else {
              callback(null, {resource: net.body.network, type: 'network'});
            }
          });
        } else {
          let networkData, subnetData, networkId;
          applyDetail.create.forEach(e => {
            if (e._type === 'Network') {
              networkData = {network: JSON.parse(JSON.stringify(e))};
            } else {
              subnetData = {subnet: JSON.parse(JSON.stringify(e))};
            }
          });
          delete networkData.network._type;
          delete networkData.network._identity;
          delete subnetData.subnet._identity;
          delete subnetData.subnet._type;
          driver.neutron.network.createNetwork(_token, remote, networkData, function(err, net) {
            if (err) {
              callback(err);
            } else {
              networkId = net.body.network.id;
              subnetData.subnet.network_id = networkId;
              driver.neutron.subnet.createSubnet(_token, remote, subnetData, function(e, subnet) {
                if (e) {
                  callback(e);
                } else {
                  callback(null, {resource: subnet.body.subnet, type: 'subnet'});
                }
              });
            }
          });
        }
      } else if (applyDetail.resourceType === 'instanceSnapshot') {
        let snapshotName = applyDetail.create[0].name;
        let instanceId = applyDetail.create[0].instanceId;
        let projectId = apply.projectId;
        let remote = req.session.endpoint.nova[region];
        driver.nova.server.createSnapshot(projectId, instanceId, snapshotName, _token, remote, function(err, d) {
          if (err) {
            callback(err);
          } else {
            callback(null, {resource: d.body.snapshot, type: 'instanceSnapshot'});
          }
        });
      } else if (applyDetail.resourceType === 'volumeSnapshot') {
        let projectId = apply.projectId;
        let remote = req.session.endpoint.cinder[region];
        let metaData = applyDetail.create[0];
        let _data = {
          snapshot: {
            name: metaData.name,
            volume_id: metaData.volume_id,
            force: true
          }
        };
        driver.cinder.snapshot.createSnapshot(projectId, _token, remote, _data, function(err, d) {
          if (err) {
            callback(err);
          } else {
            callback(null, {resource: d.body.snapshot, type: 'volumeSnapshot'});
          }
        });
      }
    });

  },

  _getCurrentRole: function (arrRoles) {
    if (!Array.isArray(arrRoles) || arrRoles.length === 0) {
      return undefined;
    }
    let result;
    //[admin,owner,member]
    flowReverse.some(function (role, i) {
      return arrRoles.indexOf(role) > -1 && (result = role);
    });

    return result;
  },

  getApplicationById: function (req, res, next) {
    let applicationId = req.params.applicationId;
    applicationDao.findOneById(applicationId).then(result => {
      result.detail = JSON.parse(result.detail);
      res.json(result);
    }).catch(err => {
      next(err);
    });
  },
  //get applications that I have approved.
  getApprovedList: function (req, res, next) {
    req.getListOptions = {
      approver: {
        approved: true,
        userId: req.session.user.userId
      }
    };

    next();
  },

  //get applications that need me to approve.
  getApprovingList: function (req, res, next) {
    let approver = {approved: false};
    approver.approverRole = this._getCurrentRole(req.session.user.roles);
    req.getListOptions = {approver: approver};
    next();

  },
  //get applications that I created.
  getMyCreateList: function (req, res, next) {
    req.getListOptions = {userId: req.session.user.userId};
    next();
  },
  getList: function (req, res, next) {
    //query options
    let fields = req.getListOptions;

    let limit = req.query.limit;
    let page = req.query.page;
    let status = req.query.status && req.query.status.split(',');
    let start = req.query.start;
    let end = req.query.end;
    if (limit) {
      fields.limit = parseInt(limit, 10);
    }
    if (page) {
      fields.page = parseInt(page, 10);
    }
    if (status && Array.isArray(status) && status.length) {
      fields.status = status;
    }
    if (start) {
      fields.start = parseInt(start, 10);
    }
    if (end) {
      fields.end = parseInt(end, 10);
    }

    applicationDao.findAllByFields(req.getListOptions).then(result => {
      let _next = (result.count / limit) > fields.page ? (fields.page + 1) : null;
      let prev = fields.page === 1 ? null : (page - 1);
      result.rows.forEach(function (item) {
        item.dataValues.detail = JSON.parse(item.dataValues.detail);
      });
      res.json({
        Applies: result.rows,
        next: _next,
        prev: prev,
        count: result.count
      });
    });
  },
  delApplicationById: function (req, res, next) {
    let application = req.application;
    application.destroy().then(res.json.bind(res), next);
  },
  updateApplicationById: function (req, res, next) {

    const detail = JSON.stringify(req.body.detail);
    const description = req.body.description;
    let application = req.application;
    if (detail) {
      application.detail = detail;
    }
    if (description) {
      application.description = description;
    }

    application.save().then(res.json.bind(res)).catch(next);

  },

  checkOwnerAndStatus: function (req, res, next) {
    let applicationId = req.params.applicationId;
    let userId = req.session.user.userId;

    applicationDao.findOneById(applicationId).then(application => {

      if (!application) {
        res.status(404).json({msg: req.i18n.__('api.application.notFound')});
        return;
      }
      if (application.userId !== userId) {
        res.status(403).json({msg: req.i18n.__('api.application.limitedAuthority')});
        return;
      }
      if (application.status !== 'pending') {
        res.status(500).json({msg: req.i18n.__('api.application.handled')});
        return;
      }
      req.application = application;
      next();
    }).catch(err => {
      next(err);
    });

  },

  initRoutes: function () {
    this.app.post('/api/apply', this.checkAuth, this.createApplication.bind(this));
    this.app.get('/api/apply/approved', this.checkAuth, this.getApprovedList.bind(this), this.getList.bind(this));
    this.app.get('/api/apply/approving', this.checkAuth, this.getApprovingList.bind(this), this.getList.bind(this));
    this.app.get('/api/apply/my-apply', this.checkAuth, this.getMyCreateList.bind(this), this.getList.bind(this));
    this.app.get('/api/apply/:applicationId', this.checkAuth, this.getApplicationById.bind(this));
    this.app.delete('/api/apply/:applicationId', this.checkAuth, this.checkOwnerAndStatus.bind(this), this.delApplicationById.bind(this));
    this.app.put('/api/apply/:applicationId', this.checkAuth, this.checkOwnerAndStatus.bind(this), this.updateApplicationById.bind(this));
    this.app.put('/api/apply/:applicationId/approve', this.checkAuth, this.approveApplication.bind(this));
  }
};

Application.prototype = Object.assign(Base.prototype, Application.prototype);

module.exports = Application;
