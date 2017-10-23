/**
 * @func: get status icon in table and details
 */
const React = require('react');
const __ = require('locale/client/bill.lang.json');

module.exports = (str) => {
  let status = str.toLowerCase();
  let type = {};

  switch(status) {
    case 'running':
      type.icon = 'active';
      type.status = 'success';
      break;
    case 'stopped':
      type.icon = 'paused';
      type.status = 'cancel';
      break;
    case 'deleted':
      type.icon = 'deleted';
      type.status = 'cancel';
      break;
    case 'changing':
      type.icon = 'loading';
      break;
    case 'error':
      type.icon = 'warning';
      type.status = 'danger';
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
