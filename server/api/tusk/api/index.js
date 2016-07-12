'use strict';
const dao = require('../dao');

module.exports = (app) => {
  app.get('/api/setting/app/:name', function(req, res, next) {
    dao.getSettingsByApp(req.params.name, req.query.refresh)
    .then(data => {
      res.status(200).json({setting: data});
    })
    .catch(err => {
      res.status(500).json({'error': err.message});
    });
  });
  app.get('/api/setting/id/:id', function(req, res, next) {
    dao.getSettingById(req.params.id, req.query.refresh)
    .then(data => {
      res.status(200).json({setting: data});
    })
    .catch(err => {
      res.status(500).json({'error': err.message});
    });
  });
  app.get('/api/setting', function(req, res, next) {
    dao.getAllSettings(req.query.refresh)
    .then(data => {
      res.status(200).json({setting: data});
    })
    .catch(err => {
      res.status(500).json({'error': err.message});
    });
  });
  app.post('/api/setting', function(req, res, next) {
    req.body.create_at = new Date();
    dao.createSetting(req.body, req.query.refresh)
    .then(data => {
      res.status(200).json({setting: data});
    })
    .catch(err => {
      res.status(500).json({'error': err.message});
    });
  });
  app.put('/api/setting/id/:id', function(req, res, next) {
    dao.updateSettingById(req.params.id, req.body)
    .then(data => {
      res.status(200).json({setting: data});
    })
    .catch(err => {
      res.status(500).json({'error': err.message});
    });
  });
  app.delete('/api/setting/id/:id', function(req, res, next) {
    dao.deleteSettingById(req.params.id)
    .then(data => {
      res.status(200).json({setting: data});
    })
    .catch(err => {
      res.status(500).json({'error': err.message});
    });
  });
};
