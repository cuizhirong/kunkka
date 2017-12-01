'use strict';

const co = require('co');

const dao = require('../../dao');
const Base = require('./../base');
const applicationDao = dao.application;
const serverNameDao = dao.server_name;
const flow = require('config')('approval_flow');//low->high
const flowReverse = JSON.parse(JSON.stringify(flow)).reverse();//high->low
const Promise = require('bluebird');
const stack = require('api/slardar/api/heat/stack');
const token = require('api/slardar/common/token');
const driver = require('server/drivers');
const tusk = require('api/tusk/dao');
const emitter = require('helpers/emitter');
require('./bindListener')(emitter);

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
      projects.some(project => {
        return (project.id === projectId ) && ( projectName = project.name);
      });
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
    }).then(data => {
      res.json(data);
      let role = flow[flow.indexOf(currentRole) + 1];
      // send notification message to approver
      emitter.emit('approver_message', {role, req, apply: data});
    }).catch(next);
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
          // Promise.all(arrSave).then(res.json.bind(res));
          Promise.all(arrSave).then(result => {
            res.json(result);
            let role = flow[flow.indexOf(currentRole) + 1];
            emitter.emit('approver_message', {role, req, apply});
          }).catch(next);
        }

      } else {// apply refused
        Promise.all([
          apply.approvals[currentIndex].save(),
          apply.save()
        ]).then(result => {
          res.json(result);
          // send notification message to applicant
          emitter.emit('applicant_message', {apply, status: 'reject', req});
        });
      }
    }).catch(next);
  },
  createResource: function(req, res, next, apply, approvals, currentIndex) {
    req.params.projectId = apply.projectId;
    let applyDetail = JSON.parse(apply.detail);
    let messageData = {apply, req, status: 'pass'};
    if (applyDetail.type === 'direct') {
      this.directCreate(req, res, next, apply, applyDetail, function(e) {
        if (e) {
          next(e);
        } else {
          Promise.all([
            approvals[currentIndex].save(),
            apply.save()
          ]).then(function () {
            res.json(apply);
            emitter.emit('applicant_message', messageData);
          });
        }
      });
    } else {
      req.body.stack = applyDetail;
      let serverName;
      co(function* () {
        if(applyDetail.create && applyDetail.create.length){
          let instanceResource, volumeResource;
          applyDetail.create.forEach(resource => {
            if (resource._type === 'Instance') {
              instanceResource = resource;
            } else if (resource._type === 'Volume') {
              volumeResource = resource;
            }
          });
          if (instanceResource && !(instanceResource.name)) {
            let serverInfo = yield [serverNameDao.getNewServerName(), tusk.getSettingsByApp('approval')];
            let prefix;
            serverInfo[1].some(setting => setting.name === 'server_name_prefix' && (prefix = setting.value));
            instanceResource.name = serverName = `${prefix}-${serverInfo[0].id}`;
            if (volumeResource && !(volumeResource.name)) {
              volumeResource.name = serverName;
            }
          }
        }

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
              if (serverName) {
                messageData.serverName = serverName;
              }
              emitter.emit('applicant_message', messageData);
            });
          } else {
            res.json(apply);
            emitter.emit('applicant_message', messageData);
          }
        });
      }).catch(next);
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
          driver.neutron.network.createNetwork(_token, remote, networkData, (err) => callback(err));
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
              driver.neutron.subnet.createSubnet(_token, remote, subnetData, (e) => callback(e));
            }
          });
        }
      } else if (applyDetail.resourceType === 'instanceSnapshot') {
        let snapshotName = applyDetail.create[0].name;
        let instanceId = applyDetail.create[0].instanceId;
        let metadata = applyDetail.create[0].metadata;
        let projectId = apply.projectId;
        let remote = req.session.endpoint.nova[region];
        driver.nova.server.createSnapshot(projectId, instanceId, snapshotName, metadata, _token, remote, (err) => callback(err));
      } else if (applyDetail.resourceType === 'volumeSnapshot') {
        let projectId = apply.projectId;
        let remote = req.session.endpoint.cinder[region];
        let metaData = applyDetail.create[0];
        let _data = {
          snapshot: {
            name: metaData.name,
            volume_id: metaData.volume_id,
            force: true,
            metadata: metaData.metadata
          }
        };
        driver.cinder.snapshot.createSnapshot(projectId, _token, remote, _data, (err) => callback(err));
      } else if (applyDetail.resourceType === 'floatingip') {
        let remote = req.session.endpoint.neutron[region];
        let floatingipData = applyDetail.create[0];
        driver.neutron.floatingip.createFloatingip(floatingipData.floating_network, floatingipData.rate_limit, _token, remote, (err) => callback(err));

      } else if (applyDetail.resourceType === 'securityGroupRule') {
        let remote = req.session.endpoint.neutron[region];
        let securityGroupRule = applyDetail.create[0];
        securityGroupRule.security_group_id = securityGroupRule.security_group;
        delete securityGroupRule._identity;
        delete securityGroupRule._type;
        delete securityGroupRule.security_group;
        let body = {
          security_group_rule: securityGroupRule
        };
        driver.neutron.security.createSecurityGroupRule(body, _token, remote, (err) => callback(err));

      } else if (applyDetail.resourceType === 'loadBalancer') {
        let remote = req.session.endpoint.neutron[region];
        let loadBalancer = applyDetail.create[0];
        delete loadBalancer._identity;
        delete loadBalancer._type;
        let body = {
          loadbalancer: loadBalancer
        };
        driver.neutron.lbaas.createLoadBalancer(body, _token, remote, (err) => callback(err));

      } else if (applyDetail.resourceType === 'resourcePool') {
        let remote = req.session.endpoint.neutron[region];
        let resourcePool = applyDetail.create[0];
        delete resourcePool._identity;
        delete resourcePool._type;
        let body = {
          pool: resourcePool
        };
        driver.neutron.lbaas.createResourcePool(body, _token, remote, (err) => callback(err));

      } else if (applyDetail.resourceType === 'healthMonitor') {
        let remote = req.session.endpoint.neutron[region];
        let healthMonitor = applyDetail.create[0];
        delete healthMonitor._identity;
        delete healthMonitor._type;
        let body = {
          healthmonitor: healthMonitor
        };
        driver.neutron.lbaas.createHealthMonitor(body, _token, remote, (err) => callback(err));

      } else if (applyDetail.resourceType === 'listener') {
        let remote = req.session.endpoint.neutron[region];
        let listener = applyDetail.create[0];
        delete listener._identity;
        delete listener._type;
        let body = {
          listener: listener
        };
        driver.neutron.lbaas.createListener(body, _token, remote, (err) => callback(err));
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
    let user = req.session.user;
    let allowToReturn = false;
    applicationDao.findOneById(applicationId).then(result => {
      if (!result) {
        return res.status(404).end();
      }
      if (!req.query.status && result.userId === user.userId) {
        allowToReturn = true;
      } else {
        let currentRole = this._getCurrentRole(user.roles);
        allowToReturn = result.approvals.some(approval => {
          if (req.query.status === 'approved') {
            return approval.userId === user.userId;
          } else if (req.query.status === 'approving') {
            return approval.approverRole === currentRole && approval.status === 'approving';
          }
        });
      }
      if (allowToReturn) {
        result.detail = JSON.parse(result.detail);
        return res.json(result);
      } else {
        return res.status(404).end();
      }
    }).catch(next);
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
  //update: admins from other projects can approve the applicantion
  getApprovingList: function (req, res, next) {
    let approver = {approved: false};
    approver.approverRole = this._getCurrentRole(req.session.user.roles);
    req.getListOptions = {approver: approver};
    // if (flow[flow.length - 1] !== approver.approverRole) {
    //   req.getListOptions.projectId = req.session.user.projectId;
    // }
    next();

  },
  //get applications that I created.
  getMyCreateList: function (req, res, next) {
    req.getListOptions = {
      userId: req.session.user.userId,
      projectId: req.session.user.projectId
    };
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
