const React = require('react');
const Slider = require('client/uskin/index').Slider;

class Progress extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: props.value ? props.value : props.min,
      hide: !!props.hide
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.value === nextState.value && this.state.hide === nextState.hide) {
      return false;
    }
    return true;
  }

  componentDidUpdate() {
    this.props.onAction(this.props.field, this.state);
  }

  render() {
    let props = this.props,
      state = this.state;
    let className = this.state.hide ? 'modal-row progress-row hide' : 'modal-row progress-row';

    return (
      <div className={className}>
        <div>
          <div>{props.__[props.field] + props.min + ' - ' + props.max + props.unit}</div>
          <Slider min={props.min} max={props.max} value={state.value} hideThumb={true} />
        </div>
        <div>{state.value + ' ' + props.unit}</div>
      </div>
    );
  }
}

module.exports = Progress;
