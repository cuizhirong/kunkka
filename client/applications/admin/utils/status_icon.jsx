/**
 * @func: get status icon in table and details
 */
const React = require('react');
const __ = require('locale/client/admin.lang.json');

module.exports = (str) => {
  let status = str.toLowerCase();
  let type = {};

  switch(status) {
    case 'active':
      type.icon = 'active';
      type.status = 'active';
      break;
    case 'enabled':
      type.icon = 'active';
      type.status = 'active';
      break;
    case 'available':
      type.icon = 'light';
      type.status = 'available';
      break;
    case 'disabled':
      type.icon = 'deleted';
      type.status = 'paused';
      break;
    case 'down':
      type.icon = 'active';
      type.status = 'down';
      break;
    case 'error':
      type.icon = 'warning';
      type.status = 'error';
      break;
    case 'in-use':
      type.icon = 'light';
      type.status = 'in-use';
      break;
    case 'paused':
      type.icon = 'paused';
      type.status = 'paused';
      break;
    case 'shutoff':
      type.icon = 'shutdown';
      type.status = 'shutoff';
      break;
    case 'n/a':
      type.icon = 'warning';
      type.status = 'error';
      break;
    default:
      type.status = 'loading';
      break;
  }

  let className = type.status === 'loading' ? 'glyphicon icon-loading status-loading'
    : 'glyphicon icon-status-' + type.icon + ' ' + type.status;

  return (
    <div className="status-data">
      <i className={className} />
      {__[status] ? __[status] : status}
    </div>
  );
};
