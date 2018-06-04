/**
 * @func: get status icon in table and details
 */
const React = require('react');


module.exports = (str) => {
  let status = str.toLowerCase();
  let type = {};

  switch(status) {
    case 'active':
    case 'alarm_status_ok':
      type.icon = 'active';
      type.status = 'active';
      break;
    case 'available':
      type.icon = 'light';
      type.status = 'available';
      break;
    case 'data_insufficient':
    case 'down':
      type.icon = 'active';
      type.status = 'down';
      break;
    case 'alarm':
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
    case 'pass':
      type.icon = 'active';
      type.status = 'pass';
      break;
    case 'refused':
      type.icon = 'warning';
      type.status = 'refused';
      break;
    case 'pending':
      type.icon = 'pending';
      type.status = 'pending';
      break;
    case 'approving':
      type.icon = 'approving';
      type.status = 'approving';
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
