var eventList = [];

class CanvasEvent {
  constructor(canvas, tooltip, circleTip) {
    this.canvas = canvas;
    this.tooltip = tooltip;
    this.circleTip = circleTip;
    canvas.addEventListener('mousemove', function(ev) {
      var _rect = canvas.getBoundingClientRect(),
        x = ev.pageX - _rect.left,
        style = {color: '#1797c6'};
      //[[{metric: {m: 16, time: '14: 00', unit: '%', x: 30, y : 84}}], [{metric: {m: 16, time: '11: 00', unit: '%', x: 60, y : 84}}], [{metric: {m: 16, time: '12: 00', unit: 'B/s', x: 30, y : 84}}], [{metric: {m: 16, time: '14: 00', unit: 'B/s', x: 30, y : 184}}]]
      eventList.some((e) => {
        var metric = e.metric;
        if (x <= metric.x) {
          tooltip.style.visibility = 'visible';
          circleTip.style.visibility = 'visible';
          tooltip.innerHTML = '<div><div>' + metric.time + '</div><div style=' + style + '>' + metric.m + ' ' + metric.unit + '</div></div>';
          tooltip.style.position = 'absolute';
          tooltip.style.left = metric.x + 'px';
          tooltip.style.top = metric.y + 'px';
          tooltip.style.background = '#fff';
          tooltip.style.padding = '10px';
          tooltip.style.boxShadow = '0 0 10px #888';
          tooltip.style.marginLeft = '14px';
          circleTip.style.position = 'absolute';
          circleTip.style.left = (metric.x - 4) + 'px';
          circleTip.style.top = (metric.y + 13) + 'px';
          circleTip.style.borderRadius = '4px';
          circleTip.style.height = '4px';
          circleTip.style.width = '4px';
          circleTip.style.border = '2px solid #a1a1a1';
          return true;
        }
        return false;
      });
    });

    canvas.addEventListener('mouseout', function(ev) {
      var _rect = canvas.getBoundingClientRect(),
        x = ev.pageX - _rect.left,
        y = ev.pageY - _rect.top;

      eventList.some((e) => {
        if (x >= canvas.width || x <= 0 || y <= 0 || y >= canvas.height) {
          tooltip.style.visibility = 'hidden';
          circleTip.style.visibility = 'hidden';
        }
        return false;
      });
    });
  }

  /**
   * @param {Object} metric - includes left, top, width, height
   * @param {Number} zIndex - only support 0, 1
   * @param {Function} cb - event listener
   */
  bind(metric, zIndex) {
    var func = null;
    if (zIndex === 0) {
      func = eventList.push;
    } else {
      func = eventList.unshift;
    }
    func.call(eventList, {
      metric: metric
    });
  }

  unBindAll() {
    eventList = [];
  }
}

module.exports = CanvasEvent;
