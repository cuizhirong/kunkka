var RSVP = require('rsvp');
var Promise = RSVP.Promise;

module.exports = function(imageList) {
  var promises = {};
  imageList.forEach((url, i) => {
    promises[i] = new Promise(function(resolve, reject) {
      var img = new Image();
      img.addEventListener('load', function() {
        resolve(img);
      }, false);
      img.src = url;
    });
  });
  return RSVP.hash(promises);
};
