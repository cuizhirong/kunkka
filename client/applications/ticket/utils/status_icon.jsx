/**
 * @func: get status icon in table and details
 */
var React = require('react');
var __ = require('locale/client/ticket.lang.json');

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
    case 'closed':
      type.icon = 'paused';
      type.status = 'closed';
      break;
    case 'pending':
      type.icon = 'pending';
      type.status = 'pending';
      break;
    case 'proceeding':
      type.icon = 'approving';
      type.status = 'proceeding';
      break;
    default:
      type.status = 'loading';
      break;
  }

  var className = type.status === 'loading' ? 'glyphicon icon-loading status-loading'
    : 'glyphicon icon-status-' + type.icon + ' ' + type.status;

  return (
    <div className="status-data">
      <i className={className} />
      {__[status] ? __[status] : status}
    </div>
  );
};
