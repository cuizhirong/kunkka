'use strict';

const multer = require('multer');
const uuid = require('node-uuid');
const config = require('config');
const Base = require('./base');
var path = require('path');

const attachmentPath = config('attachment_path') || '/opt/attachment/nfs';
const sendFileOpts = {
  root: attachmentPath
};

const storage = multer.diskStorage({
  destination: path.join(attachmentPath, uuid.v1()),
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({storage: storage, limits: {fileSize: config('file_size_limit') || 10 * 1024 * 1024}});

function Attachment (app) {
  Base.call(this);
  this.app = app;
}

Attachment.prototype = {
  createAttachment: function (req, res, next) {
    let owner = req.session.user.userId;
    let pathSplit = req.file.path.split(path.sep);
    res.json({attachment_url: `/api/ticket/${owner}/attachments/${pathSplit[pathSplit.length - 2]}/${req.file.filename}`});
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
