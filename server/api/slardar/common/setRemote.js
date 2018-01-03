'use strict';

const config = require('config');
const endpointType = config('endpoint_type') || 'internal';
const Url = require('url');

module.exports = function setRemote(catalog) {
  const remotes = {};
  catalog.forEach(service => {
    let oneRemote;
    if (!remotes[service.name]) {
      remotes[service.name] = oneRemote = {};
    }
    if (service.name === 'swift') {
      service.endpoints.forEach(endpoint => {
        if (endpoint.interface === endpointType) {
          oneRemote[endpoint.region_id] = endpoint.url;
        }
        if(endpoint.interface === 'public') {
          oneRemote[endpoint.region_id + '_PUBLICPORT'] = Url.parse(endpoint.url).port;
        }
      });
    } else {
      service.endpoints.forEach(endpoint => {
        if (endpoint.interface === endpointType) {
          oneRemote[endpoint.region_id] = endpoint.url.split('/').slice(0, 3).join('/');
        }
      });
    }
  });
  return remotes;
};
