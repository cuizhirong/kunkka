'use strict';

const models = require('../models');
const serverName = models.server_name;

exports.getNewServerName = () => {
  return serverName.create();
};
