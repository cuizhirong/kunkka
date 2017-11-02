'use strict';
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
const ejs = require('ejs');
const Base = require('../base.js');
const driver = new Base();
const config = require('config');
const smtpConfig = config('smtp');

const templates = {};
fs.readdirSync(path.join(__dirname, 'templates'))
.forEach(file => {
  templates[file.split('.')[0]] = fs.readFileSync(path.join(__dirname, 'templates', file), 'utf8');
});

const transporter = nodemailer.createTransport(smtpConfig);
transporter.sendEmailAsync = (data) => {
  return new Promise((resolve, reject) => {
    transporter.sendMail(data, (err, info) => {
      if (err) {
        reject(err);
      } else {
        resolve(info);
      }
    });
  });
};

/*** Promise ***/
driver.sendEmailAsync = function (to, subject, text) {
  return transporter.sendEmailAsync({to, subject, text, from: smtpConfig.auth.user});
};

/*** Promise ***/
driver.sendEmailByTemplateAsync = function (to, subject, data, templateName) {
  if (templateName && templates[templateName] === undefined) {
    throw new Error('模板不存在');
  }
  let content = ejs.render(templates[templateName || 'default'], data);
  return transporter.sendEmailAsync({to, subject, html: content, from: smtpConfig.auth.user});
};
module.exports = driver;
