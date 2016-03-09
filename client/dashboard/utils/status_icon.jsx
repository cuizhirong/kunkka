/**
 * @func: get status icon in table and details
 */
var React = require('react');
var __ = require('i18n/client/lang.json');

module.exports = (str) => {
  var status = str.toLowerCase();
  var type = {};

  switch(status) {
    case 'active':
      type.icon = 'active';
      type.status = 'active';
      break;
    case 'available':
      type.icon = 'light';
      type.status = 'available';
      break;
    case 'down':
      type.icon = 'active';
      type.status = 'down';
      break;
    case 'in-use':
      type.icon = 'light';
      type.status = 'in-use';
      break;
    case 'shutoff':
      type.icon = 'paused';
      type.status = 'shutoff';
      break;
    default:
      break;
  }

  return (
    <span>
      <i className={'glyphicon icon-status-' + type.icon + ' ' + type.status} />
      {__[status]}
    </span>
  );
};
