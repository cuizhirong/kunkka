'use strict';
const path = require('path');
const fs = require('fs');
const co = require('co');
const nodemailer = require('nodemailer');
const ejs = require('ejs');
const Base = require('../base.js');
const driver = new Base();
const config = require('config');
const smtpConfig = config('smtp');
const getSettingsByApp = require('api/tusk/dao').getSettingsByApp;

const logger = require('middlewares/logger').logger;

const templates = {};
fs.readdirSync(path.join(__dirname, 'templates'))
  .forEach(file => {
    templates[file.split('.')[0]] = fs.readFileSync(path.join(__dirname, 'templates', file), 'utf8');
  });

const transporter = nodemailer.createTransport(smtpConfig);
transporter.sendEmailAsync = (data) => {
  return new Promise((resolve, reject) => {
    transporter.sendMail(data, (err, info) => {
      let content = `SENDEMAIL ${new Date().toLocaleString()} to:${data.to} RESULT:${err ? 'ERROR' : 'SUCCESS'}`;
      logger.info(content);

      if (err) {
        reject(err);
      } else {
        resolve(info);
      }
    });
  });
};

/*** Promise ***/
driver.sendEmailByTemplateAsync = function (to, subject, data, templateName) {
  return co(function* () {
    if (templateName && templates[templateName] === undefined) {
      throw new Error('模板不存在');
    }
    let corData = {
      corporationName: '',
      emailLogoUrl: '',
      homeUrl: ''
    };
    let settings = yield getSettingsByApp('auth');
    settings.some(setting => {
      switch (setting.name) {
        case 'corporation_name':
          corData.corporationName = setting.value;
          break;
        case 'email_logo_url':
          corData.emailLogoUrl = setting.value;
          break;
        case 'home_url':
          corData.homeUrl = setting.value;
          break;
        default:
          break;
      }
      setting.name === 'corporation_name' && (corData.corporationName = setting.value);
      setting.name === 'email_logo_url' && (corData.emailLogoUrl = setting.value);
      setting.name === 'home_url' && (corData.homeUrl = setting.value);
    });
    let content = ejs.render(templates[templateName || 'default'], Object.assign(corData, data));
    return yield transporter.sendEmailAsync({to, subject, html: content, from: smtpConfig.auth.user});

  });
};
module.exports = driver;
