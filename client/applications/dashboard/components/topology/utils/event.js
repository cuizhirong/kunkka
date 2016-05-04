var eventList = [],
  callback = null;

class CanvasEvent {
  constructor(canvas) {
    this.canvas = canvas;
    canvas.addEventListener('mousemove', function(ev) {
      var _rect = canvas.getBoundingClientRect(),
        x = ev.pageX - _rect.left,
        y = ev.pageY - _rect.top;

      var b = eventList.some((e) => {
        var metric = e.metric;
        if (x >= metric.left && x <= (metric.left + metric.width) &&
          y >= metric.top && y <= (metric.top + metric.height)) {

          canvas.style.cursor = 'pointer';
          callback = e.cb;
          return true;
        }
        return false;
      });
      if (!b) {
        canvas.style.cursor = 'default';
        callback = null;
      }
    });

    canvas.addEventListener('click', function() {
      callback && callback();
    });
  }

  /**
   * @param {Object} metric - includes left, top, width, height
   * @param {Number} zIndex - only support 0, 1
   * @param {Function} cb - event listener
   */
  bind(metric, zIndex, cb) {
    if (zIndex === 0) {
      eventList.push({
        metric: metric,
        cb: cb
      });
    } else {
      eventList.unshift({
        metric: metric,
        cb: cb
      });
    }
  }

  unBindAll() {
    eventList = [];
  }
}

module.exports = CanvasEvent;
