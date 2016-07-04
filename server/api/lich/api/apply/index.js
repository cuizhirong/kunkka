'use strict';

const dao = require('../../dao');
const Base = require('./../base');
const applyDao = dao.apply;
const flow = require('config')('apply_approve').flow;


function Apply (app) {
  Base.call(this);
  this.app = app;
}

Apply.prototype = {
  createApply: function (req, res, next) {
    let owner = req.params.owner;
    let title = req.body.title;
    let description = req.body.description;
    let status = 'approving';

    if (!req.session.user || !Array.isArray(req.session.user.roles)) {
      res.status(500).json({msg: req.i18n.__('api.apply.limitedAuthority'), code: -1});
      return;
    }

    let roleIndex = Apply.prototype._getCurrentRoleIndex(req.session.user.roles);

    let approvers = flow.slice(roleIndex + 1);
    let _approvers = [];
    approvers.forEach(function (item, i) {
      _approvers.push({
        approver: item,
        status: 'nostart',
        level: i + 1
      });
    });

    if (_approvers.length) {
      _approvers[0].status = 'approving';
    }


    applyDao.create({
      title: title,
      description: description,
      owner: owner,
      status: status,
      approves: _approvers
    }).then(result => {
      res.status(200).json(result);
    }).catch(err => {
      res.status(500).json(err);
    });
  },
  approveApply: function (req, res, next) {
    let applyId = req.params.applyId;
    let data = req.body;
    let roleIndex = Apply.prototype._getCurrentRoleIndex(req.session.user.roles);
    let currentRole = flow[roleIndex];

    applyDao.findOneById(applyId).then(apply => {
      let approves = apply.approves;
      let currentIndex = -1;
      let hasApprove = approves.some((approve, i) => {
        if (approve.approver === currentRole) {
          currentIndex = i;
          return true;
        }
      });
      if (!hasApprove) {
        return res.status(500).json({msg: req.i18n.__('api.apply.limitedAuthority'), code: -1});
      }

      if (approves[currentIndex].status === 'done') {
        return res.status(500).json({msg: req.i18n.__('api.apply.hadBeenApproved'), code: -1});
      } else if (approves[currentIndex].status === 'nostart') {
        return res.status(500).json({msg: req.i18n.__('api.apply.unopened'), code: -1});
      } else if (approves[currentIndex].status !== 'approving') {
        return res.status(500).json({msg: req.i18n.__('api.apply.approvedError'), code: -1});
      }

      approves[currentIndex].result = data.result;
      approves[currentIndex].explain = data.explain;
      approves[currentIndex].status = 'done';

      if (currentIndex === approves.length - 1) {//last approve
        apply.status = data.result;
        return Promise.all([
          apply.approves[currentIndex].save(),
          apply.save()
        ]);

      } else {
        approves[currentIndex + 1].status = 'approving';
        return Promise.all([
          apply.approves[currentIndex].save(),
          apply.approves[currentIndex + 1].save()
        ]);

      }

    }).then(result=> {
      res.json(result);
    }).catch(err => {
      res.status(500).json(err);
    });
  },

  _getCurrentRoleIndex: function (arrRoles) {
    if (!Array.isArray(arrRoles)) {
      return false;
    }

    let roleList = Object.keys(flow).reverse();
    let roleIndex = -1;

    roleList.some(function (role) {
      roleIndex = arrRoles.indexOf(role);
      return roleIndex > -1;
    });

    return roleIndex;
  },

  getApplyList: function (req, res, next) {
    Apply.prototype._getApply(req, res, {self: false});
  },

  getMyApplyList: function (req, res, next) {
    Apply.prototype._getApply(req, res, {self: true});
  },

  _getApply: function (req, res, options) {
    let owner = req.params.owner;
    let limit = req.query.limit;
    let page = req.query.page;
    let status = req.query.status && req.query.status.split(',');
    let start = req.query.start;
    let end = req.query.end;
    let fields = {};
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

    if (options.self) {
      fields.owner = owner;
    } else {
      if (req.session.user && Array.isArray(req.session.user.roles)) {
        let roleIndex = Apply.prototype._getCurrentRoleIndex(req.session.user.roles);
        fields.approver = flow[roleIndex];
      }
    }


    applyDao.findAllByFields(fields).then(result => {
      let _next = (result.count / limit) > fields.page ? (fields.page + 1) : null;
      let prev = fields.page === 1 ? null : (page - 1);
      res.json({
        Applies: result.rows,
        next: _next,
        prev: prev,
        count: result.count
      });
    });
  },

  getApplyById: function (req, res, next) {
    let applyId = req.params.applyId;
    applyDao.findOneById(applyId).then(result => {
      res.json(result);
    }).catch(err => {
      res.status(500).json(err);
    });
  },
  initRoutes: function () {
    this.app.post('/api/apply/:owner/apply', this.checkOwner, this.createApply);
    this.app.get('/api/apply/:owner/apply', this.checkOwner, this.getApplyList);
    this.app.get('/api/apply/:owner/my-apply', this.checkOwner, this.getMyApplyList);
    this.app.get('/api/apply/:owner/apply/:applyId', this.checkOwner, this.getApplyById);
    this.app.put('/api/apply/:owner/approve/:applyId', this.checkOwner, this.approveApply);
  }
};

Apply.prototype = Object.assign(Base.prototype, Apply.prototype);

module.exports = Apply;
