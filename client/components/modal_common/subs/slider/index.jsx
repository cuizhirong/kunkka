var React = require('react');
var Slider = require('client/uskin/index').Slider;

class Slide extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: props.value ? props.value : props.min,
      hide: !!props.hide,
      max: props.max,
      min: props.min
    };

    this.onInputChange = this.onInputChange.bind(this);
    this.onSliderChange = this.onSliderChange.bind(this);
    this.onBlur = this.onBlur.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.value === nextState.value && this.state.hide === nextState.hide && this.state.max === nextState.max && this.state.min === nextState.min) {
      return false;
    }
    return true;
  }

  componentDidUpdate() {
    this.props.onAction(this.props.field, this.state);
  }

  onInputChange(e) {
    var props = this.props,
      state = this.state;
    var value = e.target.value;
    var v = parseFloat(value);
    if (!isNaN(v)) {
      if (props.initValue && props.increase && props.initValue > state.min && v < props.initValue) {
        v = props.initValue;
      } else if (v < state.min) {
        v = state.min;
      }
      if (v > state.max) {
        v = state.max;
      }
      this.setState({
        value: v
      });
    }
  }

  onSliderChange(e, value) {
    this.setState({
      value: value
    });
  }

  onBlur(e) {
    var value = e.target.value;
    if (value.length < 1) {
      value = this.state.min;
      this.setState({
        value: value
      });
    }
  }

  render() {
    var props = this.props,
      state = this.state;
    var className = 'modal-row slider-row';
    if (props.is_long_label) {
      className += ' label-row long-label-row';
    } else {
      className += ' label-row';
    }
    if (state.hide) {
      className += ' hide';
    }

    return (
      <div className={className}>
        <div>
          {props.label}
        </div>
        <div>
          <div className="slidearea">
            <Slider min={state.min} max={state.max} step={props.step} value={state.value} onChange={this.onSliderChange} />
            <div className="range">{state.min + '-' + state.max + props.unit}</div>
          </div>
          <div className="inputarea">
            <input type="text" value={state.value} onBlur={this.onBlur} onChange={this.onInputChange} />
            <label className="unit">{props.unit}</label>
          </div>
        </div>
      </div>
    );
  }
}

module.exports = Slide;
