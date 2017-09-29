const RSVP = require('rsvp');
const Promise = RSVP.Promise;

module.exports = function(imageList) {
  let promises = {};
  imageList.forEach((url, i) => {
    promises[i] = new Promise(function(resolve, reject) {
      let img = new Image();
      img.addEventListener('load', function() {
        resolve(img);
      }, false);
      img.src = url;
    });
  });
  return RSVP.hash(promises);
};
