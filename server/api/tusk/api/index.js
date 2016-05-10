'use strict';
const driver = require('../driver');

module.exports = (app) => {
  app.get('/api/setting/app/:name', function(req, res, next) {
    driver.getSettingsByApp(req.params.name, function (err, data) {
      if (err) {
        res.status(500).json({'error': err.message});
      } else {
        res.status(200).json({setting: { [req.params.name]: data }});
      }
    }, req.query.refresh);
  });
  app.get('/api/setting/id/:id', function(req, res, next) {
    driver.getSettingById(req.params.id, function (err, data) {
      if (err) {
        res.status(500).json({'error': err.message});
      } else {
        res.status(200).json({setting: data});
      }
    }, req.query.refresh);
  });
  app.get('/api/setting', function(req, res, next) {
    driver.getAllSettings(function (err, data) {
      if (err) {
        res.status(500).json({'error': err.message});
      } else {
        res.status(200).json({setting: data});
      }
    }, req.query.refresh);
  });
  app.post('/api/setting', function(req, res, next) {
    req.body.create_at = new Date();
    driver.createSetting(req.body, function(err, data) {
      if (err) {
        res.status(500).json({'error': err.message});
      } else {
        res.status(200).json({settings: data});
      }
    });
  });
  app.put('/api/setting/id/:id', function(req, res, next) {
    driver.updateSettingById(req.params.id, req.body, function(err, data) {
      if (err) {
        if (err === 404) {
          res.status(404).json({error: 'Item not Found.'});
        } else {
          res.status(500).json({'error': err.message});
        }
      } else {
        res.status(200).json({settings: data});
      }
    });
  });
  app.delete('/api/setting/id/:id', function(req, res, next) {
    driver.deleteSettingById(req.params.id, function(err, data) {
      if (err) {
        if (err === 404) {
          res.status(404).json({error: 'Item not Found.'});
        } else {
          res.status(500).json({'error': err.message});
        }
      } else {
        res.status(200).json({settings: data});
      }
    });
  });
};
