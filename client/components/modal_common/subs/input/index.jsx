const React = require('react');
const ShortTip = require('../short_tip/index');

class Input extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: props.value ? props.value : '',
      disabled: !!props.disabled,
      hide: !!props.hide,
      error: false,
      tip_info: props.tip_info || ''
    };

    this.onChange = this.onChange.bind(this);
  }

  onChange(e) {
    this.setState({
      value: e.target.value
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    for (let index in this.state) {
      if (this.state[index] !== nextState[index]) {
        return true;
      }
    }
    return false;
  }

  componentDidUpdate() {
    this.props.onAction(this.props.field, this.state);
  }

  render() {
    let props = this.props,
      state = this.state;
    let className = 'modal-row input-row';
    if (props.is_long_label) {
      className += ' label-row long-label-row';
    } else {
      className += ' label-row';
    }
    if (this.state.hide) {
      className += ' hide';
    }

    return (
      <div className={className}>
        <div>
          {
            props.required && <strong>*</strong>
          }
          {props.label}
        </div>
        <div>
          <input className={this.state.error ? 'error' : ''} type={props.input_type} disabled={this.state.disabled} onChange={this.onChange} value={this.state.value} />
          {
            state.tip_info && <ShortTip label={props.__[state.tip_info] || state.tip_info} />
          }
        </div>
      </div>
    );
  }
}

module.exports = Input;
