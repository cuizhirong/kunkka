'use strict';

module.exports = function setRemote(catalog) {
  let remote = {};
  let oneRemote;
  for (let i = 0, l = catalog.length, service = catalog[0]; i < l; i++, service = catalog[i]) {
    if (!remote[service.name]) {
      remote[service.name] = oneRemote = {};
    }
    for (let j = 0, m = service.endpoints.length, endpoint = service.endpoints[0]; j < m; j++, endpoint = service.endpoints[j]) {
      if (endpoint.interface === 'public') {
        oneRemote[endpoint.region_id] = service.name === 'swift' ? endpoint.url : endpoint.url.split('/').slice(0, 3).join('/');
        break;
      }
    }
  }
  return remote;
};
