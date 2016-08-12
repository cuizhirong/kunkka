'use strict';

const dao = require('../../dao');
const Base = require('../base');
const ticketDao = dao.ticket;
const attachmentDao = dao.attachment;
const flow = require('config')('ticket_flow') || ['admin', 'owner', 'Member'];

function Ticket (app) {
  Base.call(this);
  this.app = app;
}

Ticket.prototype = {
  createTicket: function (req, res, next) {
    let owner = req.params.owner;
    let username = req.session.user.username;
    let title = req.body.title;
    let description = req.body.description;
    let type = req.body.type;
    let status = req.body.status;
    let projectId = req.session.user.projectId;
    let attachments = req.body.attachments || [];
    let _attachments = [];
    attachments.forEach(a => {
      _attachments.push({
        owner: owner,
        url: a
      });
    });

    if (!req.session.user || !Array.isArray(req.session.user.roles)) {
      return next({msg: req.i18n.__('api.ticket.permissionDenied'), code: -1});
    }

    let roleIndex = this.getRoleIndex(req.session.user.roles);

    if (roleIndex < 0) {
      return next({msg: req.i18n.__('api.ticket.permissionDenied')});
    } else if (roleIndex === 0) {
      return next({msg: req.i18n.__('api.ticket.cannotCreate')});
    }

    ticketDao.create({
      title: title,
      description: description,
      owner: owner,
      type: type,
      projectId: projectId,
      status: status,
      username: username,
      role: flow[roleIndex],
      handlerRole: flow[roleIndex - 1],
      attachments: _attachments
    }).then(res.json.bind(res), next);
  },

//owner update ticket content
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
    ticketDao.findOneByIdAndOwner(ticketId, owner).then(ticket => {
      if (!ticket) {
        return next({msg: req.i18n.__('api.ticket.notExist')});
      }

      if (ticket.status !== 'processing') {
        return next({msg: req.i18n.__('api.ticket.cannotUpdate')});

      }
      if (data.attachments) {
        data.attachments = _attachments;
      }
      Object.assign(ticket, data);
      ticket.save().then(res.json.bind(res));
    }).catch(next);
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

  getHandlerTicketList: function (req, res, next) {
    this.getTicketList(req, res, next, {self: false});
  },

  getSelfTicketList: function (req, res, next) {
    this.getTicketList(req, res, next, {self: true});
  },

  getTicketList: function (req, res, next, options) {
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
      fields.processor = req.session.user.userId;

      if (req.session.user && Array.isArray(req.session.user.roles)) {
        let roleIndex = this.getRoleIndex(req.session.user.roles);
        fields.handlerRole = flow[roleIndex];
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
    const ticketId = req.params.ticketId;
    const roleIndex = this.getRoleIndex(req.session.user.roles);
    if (roleIndex < 0) {
      return res.status(403).json(req.i18n__('api.ticket.permissionDenied'));
    }
    ticketDao.findOneById(ticketId).then(ticket => {

      if (!ticket) {
        return next({msg: req.i18n.__('api.ticket.notExist')});
      }

      if (ticket.owner === req.session.user.userId
        || (ticket.status === 'processing' && ticket.processor === req.session.user.userId )
        || (ticket.status !== 'processing' && ticket.handlerRole === flow[roleIndex])) {
        res.json(ticket);
      } else {
        next({msg: req.i18n.__('api.ticket.notExist')});
      }
    }).catch(next);
  },

  ownerUpdate: function (req, res, next) {
    const ticketId = req.params.ticketId;
    const status = req.body.status;

    ticketDao.findOneByIdAndOwner(ticketId, req.session.user.userId).then(ticket=> {

      if (!ticket) {
        return next({msg: req.i18n.__('api.ticket.notExist')});
      }
      if (status !== 'closed' && status !== 'pending') {
        return next({msg: req.i18n.__('api.ticket.statusCannotBe') + req.i18n.__('api.ticket.' + status)});
      }
      if (ticket.owner === req.session.user.userId) {
        ticket.status = status;
        ticket.processor = '';
        ticket.save().then(res.json.bind(res), next);
      } else {
        next({msg: req.i18n.__('api.ticket.permissionDenied')});
      }
    });
  },
  handlerUpdate: function (req, res, next) {
    let ticketId = req.params.ticketId;
    let status = req.body.status;
    ticketDao.findOneById(ticketId).then(ticket=> {
      const roleIndex = this.getRoleIndex(req.session.user.roles);

      //proceeding+processor
      //pending+role
      if ((ticket.status === 'proceeding' && ticket.processor === req.session.user.userId)
        || (ticket.status !== 'proceeding' && ticket.handlerRole === flow[roleIndex])) {
        ticket.status = status;
        if (status === 'proceeding') {
          ticket.processor = req.session.user.userId;
        } else {
          ticket.processor = '';
        }
        ticket.save().then(res.json.bind(res), next);
      } else {
        next({msg: req.i18n.__('api.ticket.permissionDenied')});
      }
    });
  },
  higherHandle: function (req, res, next) {
    const ticketId = req.params.ticketId;
    ticketDao.findOneById(ticketId).then(ticket=> {
      const roleIndex = this.getRoleIndex(req.session.user.roles);

      if (roleIndex < 1) {
        return next({msg: req.i18n.__('api.ticket.noHigher')});
      }

      if ((ticket.status === 'proceeding' && ticket.processor === req.session.user.userId)
        || (ticket.status !== 'proceeding' && ticket.handlerRole === flow[roleIndex])) {
        ticket.status = 'pending';
        ticket.handlerRole = flow[roleIndex - 1];
        ticket.processor = '';
        ticket.save().then(res.json.bind(res), next);
      } else {
        next({msg: req.i18n.__('api.ticket.permissionDenied')});
      }
    });
  },
  initRoutes: function () {
    //create
    this.app.post('/api/ticket/:owner/tickets', this.checkOwner, this.createTicket.bind(this));
    //list
    this.app.get('/api/ticket/:owner/tickets', this.getHandlerTicketList.bind(this));
    //self-list
    this.app.get('/api/ticket/:owner/self-tickets', this.checkOwner, this.getSelfTicketList.bind(this));
    //get ticket
    this.app.get('/api/ticket/:owner/tickets/:ticketId', this.getTicketById.bind(this));
    //update
    this.app.put('/api/ticket/:owner/tickets/:ticketId', this.checkOwner, this.updateTicket.bind(this));
    //add attachment
    this.app.post('/api/ticket/:owner/tickets/:ticketId/attachments', this.checkOwner, this.addAttachments.bind(this));
    //owner:open/close
    this.app.put('/api/ticket/:owner/tickets/:ticketId/owner', this.ownerUpdate.bind(this));
    //handler:pending processing closed
    this.app.put('/api/ticket/:owner/tickets/:ticketId/handler', this.handlerUpdate.bind(this));
    //higherHandle
    this.app.put('/api/ticket/:owner/tickets/:ticketId/higher', this.higherHandle.bind(this));

  }
};

Ticket.prototype = Object.assign(Base.prototype, Ticket.prototype);

module.exports = Ticket;
