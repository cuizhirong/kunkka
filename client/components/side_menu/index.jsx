require('./style/index.less');

var React = require('react');
var Menu = require('client/uskin/index').Menu;

var SLIDER_MIN_HEIGHT = 70;
var MOUSEMOVE = 'mousemove',
  MOUSEUP = 'mouseup',
  MOUSEDOWN = 'mousedown',
  MOUSEENTER = 'mouseenter',
  MOUSEWHEEL = 'mousewheel',
  UP = 'up',
  DOWN = 'down',
  ENTER = 'enter',
  DRAG = 'drag',
  RESIZE = 'resize',
  SCROLL = 'scroll',
  WHEEL = 'wheel',
  PANEDOWN = 'panedown',
  TOUCHMOVE = 'touchmove';

class SideMenu extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.haloScroller();
  }

  haloScroller() {
    this.container = this.refs.halo_com_menu;
    this.content = this.container.getElementsByClassName('menu')[0];
    this.pane = this.refs.halo_scroll_pane;
    this.slider = this.refs.halo_scroll_slider;

    this.createEvents();
    this.addEvents();
    this.reset();
  }

  scroll() {
    if (!this.isActive) {
      return;
    }
    this.sliderY = Math.max(0, this.sliderY);
    this.sliderY = Math.min(this.maxSliderTop, this.sliderY);

    this.content.scrollTop = this.maxScrollTop * this.sliderY / this.maxSliderTop;
    this.updateScrollValues();
    this.slider.style.transform = 'translate(0, ' + this.sliderTop + 'px)';
  }

  trigger(eventType, target) {
    if(document.createEvent) {
      var eventObj = document.createEvent(eventType);
      eventObj.initEvent(eventType, true, false );
      target.dispatchEvent(eventObj);
    } else if (document.createEventObject) {
      target.fireEvent('on' + eventType);
    }
  }

  bind(target, eventType, handler) {
    if (window.addEventListener) {
      target.addEventListener(eventType, handler, false);
    } else if (target.attachEvent) {
      target.attachEvent('on' + eventType, handler);
    } else {
      target['on' + eventType] = handler;
    }
    return target;
  }

  unbind(target, eventType, handler) {
    if (window.removeEventListener) {
      target.removeEventListener(eventType, handler, false);
    } else if (window.detachEvent) {
      target.detachEvent(eventType, handler);
    } else {
      target['on' + eventType] = '';
    }
  }

  createEvents() {
    this.events = {
      down: (function(_this) {
        return function(e) {
          e.stopPropagation();
          _this.isBeingDragged = true;
          _this.offsetY = e.pageY - _this.container.offsetTop - _this.slider.offsetTop;
          if (!(_this.slider === e.target)) {
            _this.offsetY = 0;
          }
          _this.pane.className = 'scroll-pane active';
          _this.bind(document, MOUSEMOVE, _this.events[DRAG]);
          _this.bind(document, MOUSEUP, _this.events[UP]);
          _this.bind(document.body, MOUSEENTER, _this.events[ENTER]);
          return false;
        };
      })(this),
      drag: (function(_this) {
        return function(e) {
          _this.sliderY = e.pageY - _this.container.offsetTop - (_this.offsetY || _this.sliderHeight * 0.5);
          _this.scroll();
          return false;
        };
      })(this),
      up: (function(_this) {
        return function(e) {
          _this.isBeingDragged = false;
          _this.pane.className = 'scroll-pane';
          _this.unbind(document, MOUSEMOVE, _this.events[DRAG]);
          _this.unbind(document, MOUSEUP, _this.events[UP]);
          _this.unbind(document.body, MOUSEENTER, _this.events[ENTER]);
          return false;
        };
      })(this),
      resize: (function(_this) {
        return function(e) {
          _this.reset();
        };
      })(this),
      panedown: (function(_this) {
        return function(e) {
          _this.sliderY = (e.offsetY || e.originalEvent.layerY) - (_this.sliderHeight * 0.5);
          _this.scroll();
          _this.events.down(e);
          return false;
        };
      })(this),
      scroll: (function(_this) {
        return function(e) {
          _this.updateScrollValues();
          if (_this.isBeingDragged) {
            return;
          }
          _this.sliderY = _this.sliderTop;
          _this.slider.style.transform = 'translate(0, ' + _this.sliderTop + 'px)';
        };
      })(this),
      wheel: (function(_this) {
        return function(e) {
          var delta;
          if (e === null) {
            return;
          }
          delta = e.delta || e.wheelDelta || (e.originalEvent && e.originalEvent.wheelDelta) || -e.detail || (e.originalEvent && -e.originalEvent.detail);
          if (delta) {
            _this.sliderY += -delta / 3;
          }
          _this.scroll();
          //return false;
        };
      })(this),
      enter: (function(_this) {
        return function(e) {
          var _ref;
          if (!_this.isBeingDragged) {
            return;
          }
          if ((e.buttons || e.which) !== 1) {
            (_ref = _this.events)[UP].apply(_ref, arguments);
            //return (_ref = _this.events)[UP].apply(_ref, arguments);
          }
        };
      })(this)
    };
  }

  addEvents() {
    var events = this.events;
    this.bind(window, RESIZE, events[RESIZE]);
    this.bind(this.slider, MOUSEDOWN, events[DOWN]);
    this.bind(this.pane, MOUSEDOWN, events[PANEDOWN]);
    this.bind(this.pane, MOUSEWHEEL, events[WHEEL]);
    this.bind(this.pane, MOUSEWHEEL, events[WHEEL]);
    this.bind(this.content, SCROLL, events[SCROLL]);
    this.bind(this.content, MOUSEWHEEL, events[SCROLL]);
    this.bind(this.content, TOUCHMOVE, events[SCROLL]);
  }

  reset() {
    var content, contentHeight, contentStyle, contentStyleOverflowY, paneHeight, paneOuterHeight, parentMaxHeight, sliderHeight;
    content = this.content;
    contentStyle = content.style;
    contentStyleOverflowY = contentStyle.overflowY;
    contentHeight = content.scrollHeight;
    parentMaxHeight = parseInt(this.container.style['max-heigh'] || 0, 10);
    if (parentMaxHeight > 0) {
      this.container.style.height = content.scrollHeight > parentMaxHeight ? parentMaxHeight : content.scrollHeight + 'px';
    }
    paneHeight = this.pane.clientHeight;
    paneOuterHeight = paneHeight;
    sliderHeight = Math.round(paneOuterHeight / contentHeight * paneHeight);
    if (sliderHeight < SLIDER_MIN_HEIGHT) {
      sliderHeight = SLIDER_MIN_HEIGHT;
    }
    this.maxSliderTop = paneOuterHeight - sliderHeight;
    this.contentHeight = contentHeight;
    this.paneHeight = paneHeight;
    this.paneOuterHeight = paneOuterHeight;
    this.sliderHeight = sliderHeight;
    this.slider.style.height = sliderHeight + 'px';
    this.events.scroll();
    this.pane.style.display = 'block';
    this.isActive = true;
    if ((content.scrollHeight === content.clientHeight) || (this.pane.scrollHeight >= content.scrollHeight && contentStyleOverflowY !== SCROLL)) {
      this.pane.style.display = 'none';
      this.isActive = false;
    } else if (this.container.clientHeight === content.scrollHeight) {
      this.slider.style.display = 'none';
    } else {
      this.slider.style.display = 'block';
    }
    this.pane.style.opacity = '';
  }

  updateScrollValues() {
    var content;
    content = this.content;
    this.maxScrollTop = content.scrollHeight - content.clientHeight;
    this.contentScrollTop = content.scrollTop;
    this.maxSliderTop = this.paneHeight - this.sliderHeight;
    this.sliderTop = this.maxScrollTop === 0 ? 0 : this.contentScrollTop * this.maxSliderTop / this.maxScrollTop;
  }

  onSwitch(k) {
    if (k === this.props.application.current_application) {
      return false;
    } else {
      window.location = '/' + k;
    }
  }

  render() {
    var props = this.props,
      apps = props.application.application_list,
      currentApp = props.application.current_application;

    return (
      <div ref="halo_com_menu" className="halo-com-menu">
        <ul className="top-menu">
          {
            apps.map((m) => {
              var k = Object.keys(m)[0];
              return (
                <li key={k} onClick={this.onSwitch.bind(this, k)} className={currentApp === k ? 'selected' : null}>
                  <i className={'glyphicon icon-g-' + k}></i>
                  <span>{m[k]}</span>
                </li>
              );
            })
          }
        </ul>
        <Menu items={props.items} />
        <div ref="halo_scroll_pane" className="scroll-pane">
          <div ref="halo_scroll_slider" className="scroll-slider"></div>
        </div>
      </div>
    );
  }
}

module.exports = SideMenu;
