'use strict';

const dao = require('../dao');
const Base = require('./base');
const ticketDao = dao.ticket;
const attachmentDao = dao.attachment;

function Ticket (app) {
  Base.call(this);
  this.app = app;
}

Ticket.prototype = {
  createTicket: function (req, res, next) {
    let owner = req.body.owner;
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
    ticketDao.create({
      title: title,
      description: description,
      owner: owner,
      type: type,
      status: status,
      attachments: _attachments
    }).then(result => {
      res.status(200).json(result);
    }).catch(err => {
      res.status(500).json(err);
    });
  },
  updateTicket: function (req, res, next) {
    let ticketId = req.params.ticketId;
    let data = req.body;
    ticketDao.findOneById(ticketId).then(ticket => {
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
    console.log(attachments);
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
  getTicketList: function (req, res, next) {
    let owner = req.params.owner;
    let limit = req.query.limit;
    let page = req.query.page;
    let fields = {};
    if (limit) {
      fields.limit = parseInt(limit, 10);
    }
    if (page) {
      fields.page = parseInt(page, 10);
    }
    if (!req.session.user.isAdmin) {
      fields.owner = owner;
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
    this.app.get('/api/ticket/:owner/tickets', this.checkOwner, this.getTicketList);
    this.app.get('/api/ticket/:owner/tickets/:ticketId', this.checkOwner, this.getTicketById);
    this.app.put('/api/ticket/:owner/tickets/:ticketId', this.checkOwner, this.updateTicket);
    this.app.post('/api/ticket/:owner/tickets/:ticketId/attachments', this.checkOwner, this.addAttachments);
  }
};

Ticket.prototype = Object.assign(Base.prototype, Ticket.prototype);

module.exports = Ticket;
