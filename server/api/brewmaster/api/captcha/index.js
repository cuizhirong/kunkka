'use strict';
const config = require('config');
const captchaExpire = config('captcha_expire');

const ccap = require('ccap');
const uuid = require('uuid');

let memcachedClient;

function Captcha (app) {
  this.app = app;
  memcachedClient = app.get('CacheClient');
}


Captcha.prototype = {

  getCaptcha: function (req, res) {

    let captcha = ccap({
      width: 200, //set width,default is 256
      height: 60, //set height,default is 60
      offset: 30, //set text spacing,default is 40
      quality: 1, //set pic quality,default is 50
      fontsize: 40 //set font size,default is 57
    });

    let ary = captcha.get();
    let token = uuid.v4();
    memcachedClient.set(token, ary[0], function (err, result) {
      if (err) {
        res.status(500).send(err);
      } else {
        res.set('captcha-token', token).send(ary[1]);
      }
    }, captchaExpire);
  },
  initRoutes: function () {
    this.app.get('/api/captcha', this.getCaptcha.bind(this));
  }

};

module.exports = Captcha;
