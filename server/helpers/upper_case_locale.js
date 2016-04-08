'use strict';

module.exports = (locale) => {
  if (locale.indexOf('-') > -1) {
    let parts = locale.split('-');
    return parts[0] + '-' + parts[1].toUpperCase();
  } else {
    return locale;
  }
};
