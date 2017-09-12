module.exports = {
  toRGB: function(value, opacity) {
    let r = parseInt(value.slice(1, 3), 16),
      g = parseInt(value.slice(3, 5), 16),
      b = parseInt(value.slice(5), 16);

    return 'rgba(' + r + ',' + g + ',' + b + ',' + opacity + ')';
  },

  bind: function(target, eventType, handler) {
    if (window.addEventListener) {
      target.addEventListener(eventType, handler, false);
    } else if (target.attachEvent) {
      target.attachEvent('on' + eventType, handler);
    } else {
      target['on' + eventType] = handler;
    }
    return target;
  },

  unbind: function(target, eventType, handler) {
    if (window.removeEventListener) {
      target.removeEventListener(eventType, handler, false);
    } else if (window.detachEvent) {
      target.detachEvent(eventType, handler);
    } else {
      target['on' + eventType] = '';
    }
  }
};
