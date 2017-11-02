'use strict';
const co = require('co');
const userModel = require('../../models').user;
const quotaModel = require('../../models').quota_approve;
const userDao = require('./db.user');
const quotaDao = require('./db.quota');
const base = require('../base');
const config = require('config');
const drivers = require('drivers');
const keystoneRemote = config('keystone');
const adminEmail = config('admin_email');

const createProjectAsync = drivers.keystone.project.createProjectAsync;
const listProjectsAsync = drivers.keystone.project.listProjectsAsync;
const listRolesAsync = drivers.keystone.role.listRolesAsync;
const addRoleToUserOnProjectAsync = drivers.keystone.role.addRoleToUserOnProjectAsync;
const updateUserAsync = drivers.keystone.user.updateUserAsync;
const Quota = require('api/slardar/api/nova/quota');
const sendEmailByTemplateAsync = drivers.email.sendEmailByTemplateAsync;

function Approve (app){
  this.app = app;
  this.memClient = app.get('CacheClient');
}

Approve.prototype = {
  listApproveUser: (req, res, next) => {
    let limit = req.query.limit;
    let page = req.query.page;
    let status = req.query.status && req.query.status.split(',');
    let fields = {};
    if (limit) {
      fields.limit = parseInt(limit, 10);
      if (page) {
        fields.page = parseInt(page, 10);
      } else {
        fields.page = 1;
      }
    }
    if (status && Array.isArray(status) && status.length) {
      fields.status = status;
    }

    userDao.findAllByFields(fields).then(result => {
      let data = {
        users: result.rows,
        count: result.count
      };
      if (limit) {
        data.next = (result.count / limit) > fields.page ? (fields.page + 1) : null;
        data.prev = fields.page === 1 ? null : (page - 1);
      }

      res.json(data);
    });
  },
  approveUser: (req, res, next) => {
    let userId = req.params.userId;
    let status = req.body.status;
    if(status !== 'pass' && status !== 'refused') {
      res.status(400).send({message: req.i18n.__('api.register.badRequest')});
    }
    co(function*() {
      let user = yield userModel.findOne({where: {id: userId}});

      if (!user) {
        return res.status(404).send({message: req.i18n.__('api.register.UserNotExist')});
      }
      if (status === 'pass') {
        //USERNAME_project
        let projectId;
        try {
          let project = yield createProjectAsync(
            req.admin.token,
            keystoneRemote,
            {project: {name: user.name + '_project'}}
          );
          projectId = project.body.project.id;
        } catch (err) {
          if (err.status === 409) {
            let projects = yield listProjectsAsync(
              req.admin.token,
              keystoneRemote,
              {name: user.name + '_project'}
            );
            projectId = projects.body.projects[0] && projects.body.projects[0].id;
          } else {
            return next(err);
          }
        }

        //GET ROLE billing_owner, project_owner
        let roles = yield listRolesAsync(req.admin.token, keystoneRemote, {});
        roles = roles.body.roles;

        const roleId = {
          'Member': ''
        };
        roles.some(role => {
          if (role.name === 'Member') {
            roleId[role.name] = role.id;
            return roleId.Member;
          }
        });
        if (!roleId.Member) {
          return next('Role "Member" NotExist');
        }

        //Assign Role & Update User
        yield [
          addRoleToUserOnProjectAsync(
            projectId,
            user.id,
            roleId.Member,
            req.admin.token,
            keystoneRemote
          ),
          updateUserAsync(
            req.admin.token,
            keystoneRemote,
            user.id,
            {user: {enabled: true, default_project_id: projectId}}
          )
        ];

        yield userModel.update({enabled: true, default_project_id: projectId}, {where: {id: user.id}});
      }

      yield user.update({status});

      res.status(204).end();
      sendEmailByTemplateAsync(
        user.email,
        req.i18n.__(`api.register.${status === 'pass' ? 'regPassed' : 'regRefused'}`),
        {
          content: `
          <p>用户名：${user.name}</p>
          <p>姓名：${user.full_name}</p>
          <p>电话：${user.phone}</p>
          <p>邮箱：${user.email}</p>
          <p>公司：${user.company}</p>
          <p>${req.i18n.__('api.register.' + (status === 'pass' ? 'regPassed' : 'regRefused'))}</p>
          `
        }
      );
    }).catch(next);
  },
  createApproveQuota: (req, res, next) => {
    let quota = req.body.quota;
    let originQuota = req.body.originQuota;
    let addedQuota = req.body.addedQuota;
    let info = req.body.info;
    let {projects, projectId, userId} = req.session.user;
    let projectName;
    projects.some(project => {
      if(project.id === projectId) {
        projectName = project.name;
        return true;
      }
    });
    co(function* (){
      let quotaDetail = yield quotaModel.create({
        status: 'pending', info,
        quota: JSON.stringify(quota),
        originQuota: JSON.stringify(originQuota),
        addedQuota: JSON.stringify(addedQuota),
        userId, projectId, projectName
      });
      res.send('ok');
      let userDB = yield userModel.findOne({where: {id: userId}});
      if (!userDB) {
        return;
      } else {
        sendEmailByTemplateAsync(
          adminEmail, `${projectName}有新的配额申请`,
          {
            content: `
            <p>用户名：${userDB.name}</p>
            <p>姓名：${userDB.full_name}</p>
            <p>电话：${userDB.phone}</p>
            <p>邮箱：${userDB.email}</p>
            <p>公司：${userDB.company}</p>

            <p><a href="http://localhost:5678/admin/quota-approval/${quotaDetail.id}">查看详情</a></p>
            `
          }
        );
      }
    }).catch(next);
  },
  approveQuota: (req, res, next) => {
    let quotaId = req.params.approveId;
    let status = req.body.status;
    if(status !== 'pass' && status !== 'refused') {
      res.status(400).send({message: req.i18n.__('api.register.badRequest')});
    }
    co(function*() {
      let quota = yield quotaModel.findOne({where: {id: quotaId}, include: [userModel]});
      if (!quota) {
        return res.status(404).send({message: req.i18n.__('api.register.badRequest')});
      }
      yield quota.update({status});
      if (status === 'pass') {
        req.params.targetId = quota.projectId;
        req.params.projectId = req.session.user.projectId;
        req.body = JSON.parse(quota.quota);
        req.headers.region = 'regionOne';
        next();
      } else {
        res.send({message: req.i18n.__('api.register.success')});
      }
      sendEmailByTemplateAsync(
        quota.user.email,
        req.i18n.__('api.register.' + (status === 'pass' ? 'quotaPassed' : 'quotaRefused')),
        {content: req.i18n.__('api.register.' + (status === 'pass' ? 'quotaPassed' : 'quotaRefused'))}
      );
    }).catch(next);
  },
  listApproveQuota: (req, res, next) => {
    let limit = req.query.limit;
    let page = req.query.page;
    let status = req.query.status && req.query.status.split(',');
    let fields = {};
    if (limit) {
      fields.limit = parseInt(limit, 10);
      if (page) {
        fields.page = parseInt(page, 10);
      } else {
        fields.page = 1;
      }
    }
    if (status && Array.isArray(status) && status.length) {
      fields.status = status;
    }

    quotaDao.findAllByFields(fields).then(result => {
      let data = {
        quota: result.rows,
        count: result.count
      };
      if (limit) {
        data.next = (result.count / limit) > fields.page ? (fields.page + 1) : null;
        data.prev = fields.page === 1 ? null : (page - 1);
      }
      data.quota.forEach(q => {
        q.quota = q.quota && JSON.parse(q.quota);
        q.originQuota = q.originQuota && JSON.parse(q.originQuota);
        q.addedQuota = q.addedQuota && JSON.parse(q.addedQuota);
      });

      res.json(data);
    });
  },
  initRoutes: function(){
    this.app.post('/api/approve-quota', this.createApproveQuota);
    this.app.get('/api/approve-quota', base.middleware.checkAdmin, this.listApproveQuota);
    this.app.put('/api/approve-quota/:approveId', base.middleware.checkAdmin, this.approveQuota, Quota.prototype.putQuota.bind(Quota.prototype));

    this.app.get('/api/approve-user', base.middleware.checkAdmin, base.middleware.checkEnableRegister, this.listApproveUser.bind(this));
    this.app.put('/api/approve-user/:userId', base.middleware.checkAdmin, base.middleware.checkEnableRegister, base.middleware.adminLogin, this.approveUser.bind(this));
  }
};

module.exports = Approve;
