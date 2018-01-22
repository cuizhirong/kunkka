'use strict';
const glob = require('glob');
const drivers = require('drivers');
const config = require('config');
const keystoneRemote = config('keystone');
const uskinFile = glob.sync('*.uskin.min.css', {cwd: 'client/dist/uskin'})[0];

const __getUserAsync = function (objVar) {
  return drivers.keystone.user.getUserAsync(objVar.token, keystoneRemote, objVar.userId);
};
const __unscopedAuthAsync = function (objVar) {
  return drivers.keystone.authAndToken.unscopedAuthAsync(objVar.username, objVar.password, objVar.domain, keystoneRemote);
};
const __scopedAuthAsync = function (objVar) {
  return drivers.keystone.authAndToken.scopedAuthAsync(objVar.projectId, objVar.token, keystoneRemote);
};
const __userProjectsAsync = function (objVar) {
  return drivers.keystone.project.getUserProjectsAsync(objVar.userId, objVar.token, keystoneRemote);
};
const __listUsersAsync = function (objVar) {
  return drivers.keystone.user.listUsersAsync(objVar.token, keystoneRemote, objVar.query);
};

const _getSettingsByApp = require('api/tusk/dao').getSettingsByApp;
const _getSettingByAppAndName = require('api/tusk/dao').getSettingByAppAndName;

const _getSetBool = function* (app, setting, defaultValue = true) {
  let result = defaultValue;
  let appSetting = yield _getSettingByAppAndName(app, setting);
  if (appSetting) {
    result = appSetting.value;
  }
  return result;
};

const _getSetNumber = function* (app, setting, defaultValue = 1) {
  let result = defaultValue;
  let appSetting = yield _getSettingByAppAndName(app, setting);
  if (appSetting) {
    result = appSetting.value;
  }
  return result;
};
const getVars = function (req, extra) {
  const objVar = {
    token: req.session.user.token,
    endpoint: req.session.endpoint,
    region: req.headers.region,
    query: req.query
  };
  /* general user to delete tenant_id. */
  if (!req.session.user.isAdmin && objVar.query.tenant_id) {
    delete objVar.query.tenant_id;
  }
  if (extra) {
    extra.forEach(e => {
      objVar[e] = req.params[e];
    });
  }
  return objVar;
};

module.exports = {
  __getUserAsync,
  __unscopedAuthAsync,
  __scopedAuthAsync,
  __userProjectsAsync,
  __listUsersAsync,

  _getSettingsByApp,
  _getSettingByAppAndName,
  _getSetBool,
  _getSetNumber,

  getVars,
  uskinFile
};
