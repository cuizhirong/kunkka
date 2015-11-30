/**
 * Module dependencies
 */
var fs = require('fs');
var path = require('path');
var yaml = require('js-yaml');

var env = process.env.NODE_ENV || 'development';

var configObj;
try {

    configObj = yaml.safeLoad(fs.readFileSync(path.resolve(__dirname, '..', '..', 'config.yml'), 'utf8'));

} catch (e) {
    configObj = {};
}

if (typeof configObj.env === 'undefined') {
    configObj.env = env;
}

function config(field) {
    return configObj[field];
}

module.exports = config;