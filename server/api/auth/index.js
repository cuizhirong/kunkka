/**
 * Internal dependencies
 */

var multer = require('multer');
var upload = multer(); // for parsing multipart/form-data
var Keystone = require('keystone');
var async = require('async');

module.exports = function(app) {
  app.post('/auth/login', upload.array(), function(req, res) {
    var username = req.body.username;
    var password = req.body.password;
    // FIXME: need to do verification
    var ProjectId,
      UserId;
    async.waterfall([
      function (cb) {
        Keystone.unscopedAuth(username, password, function(err, response) {
          if (err) {
            cb(err);
          } else {
            var userId = UserId = response.body.token.user.id;
            var token = response.header['x-subject-token'];
            cb(null, userId, token);
          }
        });
      },
      function (userId, token, cb) {
        Keystone.getUserProjects(userId, token, function(err, response) {
          if (err) {
            cb(err);
          } else {
            var projects = response.body.projects;
            if (projects.length < 1) {
              cb({error: 'no project'});
            } else {
              var projectId = ProjectId = projects[0].id;
              cb(null, projectId, token);
            }
          }
        });
      },
      function (projectId, token, cb) {
        Keystone.scopedAuth(projectId, token, function(err, response) {
          if (err) {
            cb(err);
          } else {
            var _token = response.header['x-subject-token'];
            cb(null, _token);
          }
        });
      }
    ],
    function (err, token) {
      if (err) {
        //FIXME: add err handler
        res.status(400).json(err);
      } else {
        var opt = {
          path: '/',
          maxAge: 600000,
          signed: true,
          httpOnly: true
        };
        var value = {
          'project_id': ProjectId,
          'user_id': UserId
        };
        res.cookie('ustack', value, opt);
        res.redirect('/app');
      }
    });
  });

  app.get('/auth/login', function(req, res) {
    res.json({
      version: 'test'
    });
  });
};
