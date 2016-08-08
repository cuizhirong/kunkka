'use strict';

const dao = require('../../dao');
const Base = require('../base');
const replyDao = dao.reply;
const flow = require('config')('invoker').flow;

function Reply (app) {
  Base.call(this);
  this.app = app;
}

Reply.prototype = {
  createReply: function (req, res, next) {
    let owner = req.params.owner;
    let ticketId = req.params.ticketId;
    let content = req.body.content;
    let username = req.session.user.username;
    let roleIndex = this.getRoleIndex(req.session.user.roles);

    replyDao.create({
      owner: owner,
      content: content,
      ticketId: ticketId,
      username: username,
      role: flow[roleIndex]
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
      res.status(500).json(err);
    });

  },
  initRoutes: function () {
    this.app.post('/api/ticket/:owner/ticket/:ticketId/reply', this.checkOwner, this.createReply.bind(this));
    this.app.put('/api/ticket/:owner/ticket/:ticketId/reply/:replyId', this.checkOwner, this.updateReply.bind(this));
    this.app.delete('/api/ticket/:owner/ticket/:ticketId/reply/:replyId', this.checkOwner, this.deleteReply.bind(this));
  }
};

Reply.prototype = Object.assign(Base.prototype, Reply.prototype);

module.exports = Reply;
