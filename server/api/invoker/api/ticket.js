'use strict';

const dao = require('../dao');
const Base = require('./base');
const ticketDao = dao.ticket;
const attachmentDao = dao.attachment;
const config = require('config')('invoker_approver');

function Ticket (app) {
  Base.call(this);
  this.app = app;
}

Ticket.prototype = {
  createTicket: function (req, res, next) {
    let owner = req.params.owner;
    let title = req.body.title;
    let description = req.body.description;
    let type = req.body.type;
    let status = req.body.status;
    let attachments = req.body.attachments;
    let _attachments = [];
    attachments.forEach(a => {
      _attachments.push({
        owner: owner,
        url: a
      });
    });

    if (!req.session.user || !Array.isArray(req.session.user.roles)) {
      return;
    }

    let currentRole = Ticket.prototype._getCurrentRole(req.session.user.roles);

    let approvers = config[currentRole] && config[currentRole].approver;
    let _approvers = [];
    approvers.forEach(role => {
      _approvers.push({
        approver: role
      });
    });

    ticketDao.create({
      title: title,
      description: description,
      owner: owner,
      type: type,
      status: status,
      attachments: _attachments,
      approvers: _approvers
    }).then(result => {
      res.status(200).json(result);
    }).catch(err => {
      res.status(500).json(err);
    });
  },
  updateTicket: function (req, res, next) {
    let ticketId = req.params.ticketId;
    let owner = req.params.owner;
    let data = req.body;
    let _attachments = [];
    if (req.body.attachments) {
      req.body.addAttachments.forEach(a => {
        _attachments.push({
          owner: owner,
          url: a
        });
      });
    }
    ticketDao.findOneById(ticketId).then(ticket => {
      if (data.attachments) {
        data.attachments = _attachments;
      }
      Object.assign(ticket, data);
      return ticket.save();
    }).then(result => {
      res.json(result);
    }).catch(err => {
      res.status(500).json(err);
    });
  },
  addAttachments: function (req, res, next) {
    let owner = req.params.owner;
    let attachments = req.body.attachments;
    let ticketId = req.params.ticketId;
    let _attachments = [];
    attachments.forEach(a => {
      _attachments.push({
        owner: owner,
        url: a,
        ticketId: ticketId
      });
    });
    attachmentDao.bulkCreate(_attachments).then(result => {
      res.json(result);
    }).catch(err => {
      res.status(500).json(err);
    });
  },
  //获取角色/
  _getCurrentRole: function (arrRoles) {
    if (!Array.isArray(arrRoles)) {
      return false;
    }

    let roleList = Object.keys(config).reverse();
    let roleIndex = -1;

    roleList.some(function (role) {
      roleIndex = arrRoles.indexOf(role);
      return roleIndex > -1;
    });

    if (roleIndex < 0) {
      return false;
    }
    return roleList[roleIndex];
  },

  getApproverTicketList: function (req, res, next) {
    Ticket.prototype.getTicketList(req, res, {self: false});
  },

  getSelfTicketList: function (req, res, next) {
    Ticket.prototype.getTicketList(req, res, {self: true});
  },

  getTicketList: function (req, res, options) {
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
        let currentRole = Ticket.prototype._getCurrentRole(req.session.user.roles);
        fields.approver = config[currentRole].scope;
      } else {
        fields.approver = [];
      }
    }


    ticketDao.findAllByFields(fields).then(result => {
      let _next = (result.count / limit) > fields.page ? (fields.page + 1) : null;
      let prev = fields.page === 1 ? null : (page - 1);
      res.json({
        tickets: result.rows,
        next: _next,
        prev: prev,
        count: result.count
      });
    });
  },

  getTicketById: function (req, res, next) {
    let ticketId = req.params.ticketId;
    ticketDao.findOneById(ticketId).then(result => {
      res.json(result);
    }).catch(err => {
      res.status(500).json(err);
    });
  },
  initRoutes: function () {
    this.app.post('/api/ticket/:owner/tickets', this.checkOwner, this.createTicket);
    this.app.get('/api/ticket/:owner/tickets', this.checkOwner, this.getApproverTicketList);
    this.app.get('/api/ticket/:owner/self-tickets', this.checkOwner, this.getSelfTicketList);
    this.app.get('/api/ticket/:owner/tickets/:ticketId', this.checkOwner, this.getTicketById);
    this.app.put('/api/ticket/:owner/tickets/:ticketId', this.checkOwner, this.updateTicket);
    this.app.post('/api/ticket/:owner/tickets/:ticketId/attachments', this.checkOwner, this.addAttachments);
  }
};

Ticket.prototype = Object.assign(Base.prototype, Ticket.prototype);

module.exports = Ticket;
