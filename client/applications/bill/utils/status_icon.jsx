/**
 * @func: get status icon in table and details
 */
var React = require('react');
var __ = require('locale/client/bill.lang.json');

module.exports = (str) => {
  var status = str.toLowerCase();
  var type = {};

  switch(status) {
    case 'deleted':
      type.icon = 'deleted';
      type.status = 'cancel';
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
