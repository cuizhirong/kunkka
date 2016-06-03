'use strict';

const multer = require('multer');
const uuid = require('node-uuid');
const config = require('config');
const Base = require('./base');

const attachmentPath = config('attachment_path') || '/opt/attachment/nfs';
const sendFileOpts = {
  root: attachmentPath
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, attachmentPath);
  },
  filename: function (req, file, cb) {
    let ext = file.originalname.split('.').pop();
    let name = ext ? (uuid.v1() + '.' + ext) : uuid.v1();
    cb(null, name);
  }
});

const upload = multer({storage: storage});

function Attachment (app) {
  Base.call(this);
  this.app = app;
}

Attachment.prototype = {
  createAttachment: function(req, res, next) {
    let owner = req.session.user.userId;
    res.json({attachment_url: `/api/ticket/${owner}/attachments/${req.file.filename}`});
  },
  getAttachmentByName: function (req, res, next) {
    let name = req.params.name;
    res.sendFile(name, sendFileOpts, function (err) {
      if (err) {
        res.status(err.status).end();
      }
    });
  },
  initRoutes: function () {
    this.app.post('/api/ticket/:owner/attachments', this.checkOwner, upload.single('attachment'), this.createAttachment);
    this.app.get('/api/ticket/:owner/attachments/:name', this.checkOwner, this.getAttachmentByName);
  }
};

Attachment.prototype = Object.assign(Base.prototype, Attachment.prototype);

module.exports = Attachment;
