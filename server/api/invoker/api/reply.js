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
    let replyId = req.params.replyId;
    let content = req.body.content;

    replyDao.findOneById(replyId).then(reply => {
      reply.content = content;
      return reply.save();
    }).then(result => {
      res.json(result);
    }).catch(err => {
      res.status(500).json(err);
    });

  },
  deleteReply: function (req, res, next) {
    let replyId = req.params.replyId;
    replyDao.findOneById(replyId).then(reply => {
      return reply.destroy();
    }).then(result => {
      res.json(result);
    }).catch(err => {
      res.status(500).json(err)
    });

  },
  getRepliesByTicket: function (req, res, next) {

  },
  initRoutes: function () {
    this.app.post('/api/ticket/:owner/ticket/:ticketId/reply', this.checkOwner, this.createReply);
    this.app.put('/api/ticket/:owner/ticket/:ticketId/reply/:replyId', this.checkOwner, this.updateReply);
    this.app.delete('/api/ticket/:owner/ticket/:ticketId/reply/:replyId', this.checkOwner, this.deleteReply);
  }
};

Reply.prototype = Object.assign(Base.prototype, Reply.prototype);

module.exports = Reply;
