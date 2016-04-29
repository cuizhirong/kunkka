var moment = require('client/libs/moment');

function getTime(time, fromNow) {
  var uniformTime = time.replace('.000000', 'Z'),
    formatter = 'YYYY-MM-DD HH:mm:ss';

  if(fromNow) {
    return moment(uniformTime).fromNow();
  } else {
    return moment(uniformTime).format(formatter);
  }
}

module.exports = getTime;
