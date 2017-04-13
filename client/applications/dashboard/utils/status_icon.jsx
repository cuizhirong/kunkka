/**
 * @func: get status icon in table and details
 */
var React = require('react');
var __ = require('locale/client/dashboard.lang.json');

module.exports = (str, option) => {
  var status = option ? option.status : str.toLowerCase();
  var type = {};

  if (option) {
    type = option.type;
  } else {
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
      case 'suspended':
        type.icon = 'paused';
        type.status = 'paused';
        break;
      case 'shutoff':
        type.icon = 'shutdown';
        type.status = 'shutoff';
        break;
      default:
        type.status = 'loading';
        break;
    }
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
