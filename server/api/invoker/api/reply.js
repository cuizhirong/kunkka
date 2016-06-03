'use strict';

const dao = require('../dao');
const Base = require('./base');
const replyDao = dao.reply;
//const ticketDao = dao.ticket;

function Reply (app) {
  Base.call(this);
  this.app = app;
}

Reply.prototype = {
  createReply: function (req, res, next) {
    let owner = req.params.owner;
    let ticketId = req.params.ticketId;
    let content = req.body.content;
    replyDao.create({
      owner: owner,
      content: content,
      ticketId: ticketId
    }).then(result => {
      res.json(result);
    }).catch(err => {
      res.status(500).json(err);
    });
  },
  updateReply: function (req, res, next) {

  },
  deleteReply: function (req, res, next) {

  },
  getRepliesByTicket: function (req, res, next) {

  },
  initRoutes: function () {
    this.app.post('/api/ticket/:owner/ticket/:ticketId/reply', this.checkOwner, this.createReply);
  }
};

Reply.prototype = Object.assign(Base.prototype, Reply.prototype);

module.exports = Reply;
