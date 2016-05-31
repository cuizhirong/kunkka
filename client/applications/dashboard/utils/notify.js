var notification = require('client/uskin/index').Notification;
var __ = require('locale/client/dashboard.lang.json');
var stack = {};

// @param data {Object} contains resource_name, stage, action, resource_type, resource_id
function notify(data) {
  var isAutoHide = true,
    icon = 'icon-status-active',
    func = notification.addNotice,
    placeholder = 'msg_notify_end',
    name = data.resource_name ? ('"' + data.resource_name + '"') : '',
    resourceType = __[data.resource_type];

  if (data.stage === 'start') {
    isAutoHide = false;
    icon = 'loading-notification';
    placeholder = 'msg_notify_start';
    stack[data.resource_id] = true;
  }

  if (stack[data.resource_id] && data.stage === 'end') {
    func = notification.updateNotice;
    delete stack[data.resource_id];
  }

  if (data.resource_type === 'router' && (data.action === 'clear_gateway' || data.action === 'set_gateway')) {
    resourceType = '';
  }

  func({
    showIcon: true,
    content: __[placeholder].replace('{0}', __[data.action]).
    replace('{1}', resourceType).
    replace('{2}', name),
    isAutoHide: isAutoHide,
    icon: icon,
    type: 'info',
    width: 300,
    id: data.resource_id
  });
}

module.exports = notify;
