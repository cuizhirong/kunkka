'use strict';
const qs = require('querystring');
const co = require('co');
const drivers = require('drivers');

module.exports = function listImageRecursive(query, marker, token, remote, images) {
  return co(function *() {
    query = query || {};
    marker ? query.marker = marker : delete query.marker;
    let result = (yield drivers.glance.image.listImagesAsync(token, remote, query)).body;
    images.push.apply(images, result.images);
    if (result.next) {
      yield listImageRecursive(query, qs.parse(result.next.split('?')[1]).marker, token, remote, images);
    }
  });
};
