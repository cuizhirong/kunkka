'use strict';

const ccap = require('ccap');

class Captcha {
  constructor(app) {
    this.app = app;
  }

  static getCaptcha(req, res) {
    let captcha = ccap({
      width: 200, //set width,default is 256
      height: 60, //set height,default is 60
      offset: 30, //set text spacing,default is 40
      quality: 50, //set pic quality,default is 50
      fontsize: 45 //set font size,default is 57
    });

    let ary = captcha.get();
    req.session.captcha = ary[0];
    res.send(ary[1]);
  }

  initRoutes() {
    this.app.get('/api/captcha', Captcha.getCaptcha);
  }
}

module.exports = Captcha;
