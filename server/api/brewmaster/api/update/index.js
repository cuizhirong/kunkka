'use strict';

let base = require('../base');
const drivers = require('drivers');

const config = require('config');
const keystoneRemote = config('keystone');

let changePassword = drivers.keystone.user.changePassword;
let updateUser = drivers.keystone.user.updateUser;


function Update (app){
  this.app = app;
}


Update.prototype = {
  initRoutes: function (){
    //Change name for user
    this.app.patch(
      '/api/user/name',
      base.middleware.checkLogin,
      this.updateName.bind(this)
    );
    //Change password for user
    this.app.patch(
      '/api/user/password',
      base.middleware.checkLogin,
      this.changePassword.bind(this)
    );

  },
  changePassword: function (req, res, next){
    let userId = req.session.user.userId;
    let password = req.body.password;
    let originalPassword = req.body.original_password;

    changePassword(
      req.session.user.token,
      keystoneRemote,
      userId,
      {user: {password: password, original_password: originalPassword}},
      function (err, result){
        if (err){
          next(err);
        } else{
          res.send(result);
        }
      }
    );
  },
  updateName: function (req, res, next){

    let name = req.body.name;
    let userId = req.session.user.userId;
    updateUser(
      req.session.user.token,
      keystoneRemote,
      userId,
      {user: {name: name}},
      function (err, result){
        if (err){
          next(err);
        } else{
          res.send(result);
        }
      }
    );
  }
};

module.exports = Update;
