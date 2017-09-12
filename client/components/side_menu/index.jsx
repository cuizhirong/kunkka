require('./style/index.less');

const React = require('react');
const Menu = require('client/uskin/index').Menu;

const SLIDER_MIN_HEIGHT = 70;
const MOUSEMOVE = 'mousemove',
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
    // if (this.props.items) {
    //   this.haloScroller('menu');
    // }
    // this.haloLeftScroller('top_menu');
  }

  haloScroller(name) {
    this['container' + name] = this.refs.halo_com_menu;
    this['content' + name] = this['container' + name].getElementsByClassName('menu')[0];
    this['pane' + name] = this.refs.halo_scroll_pane;
    this['slider' + name] = this.refs.halo_scroll_slider;

    this.createEvents(name);
    this.addEvents(name);
    this.reset(name);
  }

  haloLeftScroller(name) {
    this['container' + name] = this.refs.halo_com_menu;
    this['content' + name] = this['container' + name].getElementsByClassName('top-menu')[0];
    this['pane' + name] = this.refs.halo_scroll_left_pane;
    this['slider' + name] = this.refs.halo_scroll_left_slider;

    this.createEvents(name);
    this.addEvents(name);
    this.reset(name);
  }

  scroll(name) {
    if (!this.isActive) {
      return;
    }
    this['sliderY' + name] = Math.max(0, this['sliderY' + name]);
    this['sliderY' + name] = Math.min(this['maxSliderTop' + name], this['sliderY' + name]);

    this['content' + name].scrollTop = this['maxScrollTop' + name] * this['sliderY' + name] / this['maxSliderTop' + name];
    this.updateScrollValues(name);
    this['slider' + name].style.transform = 'translate(0, ' + this['sliderTop' + name] + 'px)';
  }

  trigger(eventType, target) {
    if(document.createEvent) {
      let eventObj = document.createEvent(eventType);
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

  createEvents(name) {
    this.events = {
      down: (function(_this) {
        return function(e) {
          e.stopPropagation();
          _this.isBeingDragged = true;
          _this.offsetY = e.pageY - _this['container' + name].offsetTop - _this['slider' + name].offsetTop;
          if (!(_this['slider' + name] === e.target)) {
            _this.offsetY = 0;
          }
          _this['pane' + name].className = 'scroll-pane active';
          _this.bind(document, MOUSEMOVE, _this.events[DRAG]);
          _this.bind(document, MOUSEUP, _this.events[UP]);
          _this.bind(document.body, MOUSEENTER, _this.events[ENTER]);
          return false;
        };
      })(this),
      drag: (function(_this) {
        return function(e) {
          _this['sliderY' + name] = e.pageY - _this['container' + name].offsetTop - (_this.offsetY || _this['sliderHeight' + name] * 0.5);
          _this.scroll(name);
          return false;
        };
      })(this),
      up: (function(_this) {
        return function(e) {
          _this.isBeingDragged = false;
          _this['pane' + name].className = 'scroll-pane';
          _this.unbind(document, MOUSEMOVE, _this.events[DRAG]);
          _this.unbind(document, MOUSEUP, _this.events[UP]);
          _this.unbind(document.body, MOUSEENTER, _this.events[ENTER]);
          return false;
        };
      })(this),
      resize: (function(_this) {
        return function(e) {
          _this.reset(name);
        };
      })(this),
      panedown: (function(_this) {
        return function(e) {
          _this['sliderY' + name] = (e.offsetY || e.originalEvent.layerY) - (_this['sliderHeight' + name] * 0.5);
          _this.scroll(name);
          _this.events.down(e);
          return false;
        };
      })(this),
      scroll: (function(_this) {
        return function(e) {
          _this.updateScrollValues(name);
          if (_this.isBeingDragged) {
            return;
          }
          _this['sliderY' + name] = _this['sliderTop' + name];
          _this['slider' + name].style.transform = 'translate(0, ' + _this['sliderTop' + name] + 'px)';
        };
      })(this),
      wheel: (function(_this) {
        return function(e) {
          let delta;
          if (e === null) {
            return;
          }
          delta = e.delta || e.wheelDelta || (e.originalEvent && e.originalEvent.wheelDelta) || -e.detail || (e.originalEvent && -e.originalEvent.detail);
          if (delta) {
            _this['sliderY' + name] += -delta / 3;
          }
          _this.scroll(name);
          //return false;
        };
      })(this),
      enter: (function(_this) {
        return function(e) {
          let _ref;
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

  addEvents(name) {
    let events = this.events;
    this.bind(window, RESIZE, events[RESIZE]);
    this.bind(this['slider' + name], MOUSEDOWN, events[DOWN]);
    this.bind(this['pane' + name], MOUSEDOWN, events[PANEDOWN]);
    this.bind(this['pane' + name], MOUSEWHEEL, events[WHEEL]);
    this.bind(this['pane' + name], MOUSEWHEEL, events[WHEEL]);
    this.bind(this['content' + name], SCROLL, events[SCROLL]);
    this.bind(this['content' + name], MOUSEWHEEL, events[SCROLL]);
    this.bind(this['content' + name], TOUCHMOVE, events[SCROLL]);
  }

  reset(name) {
    let content, contentHeight, contentStyle, contentStyleOverflowY, paneHeight, paneOuterHeight, parentMaxHeight, sliderHeight;
    content = this['content' + name];
    contentStyle = content.style;
    contentStyleOverflowY = contentStyle.overflowY;
    contentHeight = content.scrollHeight;
    parentMaxHeight = parseInt(this['container' + name].style['max-heigh'] || 0, 10);
    if (parentMaxHeight > 0) {
      this['container' + name].style.height = content.scrollHeight > parentMaxHeight ? parentMaxHeight : content.scrollHeight + 'px';
    }
    paneHeight = this['pane' + name].clientHeight;
    paneOuterHeight = paneHeight;
    sliderHeight = Math.round(paneOuterHeight / contentHeight * paneHeight);
    if (sliderHeight < SLIDER_MIN_HEIGHT) {
      sliderHeight = SLIDER_MIN_HEIGHT;
    }
    this['maxSliderTop' + name] = paneOuterHeight - sliderHeight;
    this['content' + name].Height = contentHeight;
    this['paneHeight' + name] = paneHeight;
    this.paneOuterHeight = paneOuterHeight;
    this['sliderHeight' + name] = sliderHeight;
    this['slider' + name].style.height = sliderHeight + 'px';
    this.events.scroll(name);
    this['pane' + name].style.display = 'block';
    this.isActive = true;
    if ((content.scrollHeight === content.clientHeight) || (this['pane' + name].scrollHeight >= content.scrollHeight && contentStyleOverflowY !== SCROLL)) {
      this['pane' + name].style.display = 'none';
      this.isActive = false;
    } else if (this['container' + name].clientHeight === content.scrollHeight) {
      this['slider' + name].style.display = 'none';
    } else {
      this['slider' + name].style.display = 'block';
    }
    this['pane' + name].style.opacity = '';
  }

  updateScrollValues(name) {
    let content;
    content = this['content' + name];
    this['maxScrollTop' + name] = content.scrollHeight - content.clientHeight;
    this['content' + name].ScrollTop = content.scrollTop;
    this['maxSliderTop' + name] = this['paneHeight' + name] - this['sliderHeight' + name];
    this['sliderTop' + name] = this['maxScrollTop' + name] === 0 ? 0 : this['content' + name].ScrollTop * this['maxSliderTop' + name] / this['maxScrollTop' + name];
  }

  onSwitch(k) {
    if (k === this.props.application.current_application) {
      return false;
    } else {
      window.location = '/' + k;
    }
  }

  render() {
    let props = this.props,
      apps = props.application.application_list,
      currentApp = props.application.current_application,
      style;

    if(!props.items) {
      style = {
        width: '96px',
        minWidth: '96px',
        maxWidth: '96px'
      };
    }
    return (
      <div ref="halo_com_menu" className="halo-com-menu" style={style}>
        <div className="top-menu">
          <ul>
            {
              apps.map((m) => {
                let k = Object.keys(m)[0];
                return (
                  <li key={k} onClick={this.onSwitch.bind(this, k)} className={currentApp === k ? 'selected' : null}>
                    <i className={'glyphicon icon-g-' + k}></i>
                    <span>{m[k]}</span>
                  </li>
                );
              })
            }
          </ul>
          {/*<div ref="halo_scroll_left_pane" className="scroll-pane">
            <div ref="halo_scroll_left_slider" className="scroll-slider" />
          </div>*/}
        </div>
        {
          props.items ?
            <div className="sub-menu">
              <Menu items={props.items} />
              {/*<div ref="halo_scroll_pane" className="scroll-pane">
                <div ref="halo_scroll_slider" className="scroll-slider"></div>
              </div>*/}
            </div>
          : null
        }
      </div>
    );
  }
}

module.exports = SideMenu;
