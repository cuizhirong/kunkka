let eventList = [],
  callback = null;

class CanvasEvent {
  constructor(canvas) {
    this.canvas = canvas;
    canvas.addEventListener('mousemove', ev => {
      let _rect = canvas.getBoundingClientRect(),
        x = ev.pageX - _rect.left,
        y = ev.pageY - _rect.top;

      let b = eventList.some(e => {
        let metric = e.metric;
        if (x >= metric.left && x <= (metric.left + metric.width) &&
          y >= metric.top && y <= (metric.top + metric.height)) {

          canvas.className = 'pointer';
          callback = e.cb;
          return true;
        }
        return false;
      });
      if (!b) {
        canvas.className = 'grab';
        callback = null;
      }
    });

    canvas.addEventListener('mousedown', () => {
      if(callback) {
        callback();
      } else {
        this.drag(canvas);
      }
    });
  }

  drag(canvas) {
    const wrapper = document.getElementById('c');
    const inner = document.getElementById('tp');
    let [ _x, _y ] = [ void(0), void(0) ];
    let moveHandler = ev => {
      let [ x, y ] = [ ev.pageX, ev.pageY ];
      if(_x && _y) {
        if(wrapper.scrollLeft + wrapper.clientWidth <= inner.clientWidth) {
          wrapper.scrollLeft -= (x - _x);
        }
        if(wrapper.scrollTop + wrapper.clientHeight <= inner.clientHeight) {
          wrapper.scrollTop -= (y - _y);
        }
      }
      [ _x, _y ] = [ x, y ];
      canvas.className = 'grabbing';
    };
    let upHandler = () => {
      canvas.className = '';
      document.removeEventListener('mousemove', moveHandler);
      document.removeEventListener('mouseup', upHandler);
    };
    document.addEventListener('mousemove', moveHandler);
    document.addEventListener('mouseup', upHandler);
  }

  /**
   * @param {Object} metric - includes left, top, width, height
   * @param {Number} zIndex - only support 0, 1
   * @param {Function} cb - event listener
   */
  bind(metric, zIndex, cb) {
    let func = null;
    if (zIndex === 0) {
      func = eventList.push;
    } else {
      func = eventList.unshift;
    }
    func.call(eventList, {
      metric: metric,
      cb: cb
    });
  }

  unBindAll() {
    eventList = [];
  }
}

module.exports = CanvasEvent;
