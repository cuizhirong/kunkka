const React = require('react');
const ShortTip = require('../short_tip/index');

class InputPassword extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: props.value ? props.value : '',
      disabled: !!props.disabled,
      hide: !!props.hide,
      visible: !!props.visible,
      error: false
    };

    this.onChange = this.onChange.bind(this);
  }

  toggleVisibility() {
    this.setState({
      visible: !this.state.visible
    });
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
    let props = this.props;
    let state = this.state;

    let className = 'modal-row input-password-row label-row';
    if (props.is_long_label) {
      className += ' long-label-row';
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
          <div className="row-item">
            {
              !state.disabled ?
                <i className={'glyphicon icon-eye password' + (state.visible ? ' selected' : '')}
                  onClick={this.toggleVisibility.bind(this)}/>
              : null
            }
            <input type={state.visible ? 'text' : 'password'}
              autoComplete="off"
              className={this.state.error ? 'error' : ''}
              value={state.value}
              onChange={this.onChange}
              disabled={state.disabled}/>
            {
              props.tip_info && <ShortTip label={props.__[props.tip_info]} />
            }
          </div>
        </div>
      </div>
    );
  }
}

module.exports = InputPassword;
