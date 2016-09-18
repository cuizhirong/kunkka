var React = require('react');
var Tooltip = require('client/uskin/index').Tooltip;
require('./style/index.less');

class Input extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showTip: false,
      value: props.value ? props.value : '',
      error: false,
      pass: false,
      loading: false,
      tipContent: props.tip ? props.__[props.name + '_tip'] : null
    };

    ['onFocus', 'onBlur'].forEach((item) => {
      this[item] = this[item].bind(this);
    });

  }

  onChange(type, e) {
    let value = e.target.value;
    this.setState({
      value: value
    });
    this.props.onChange && this.props.onChange(type, value);
  }

  onFocus(e) {
    this.setState({
      showTip: true
    });
  }

  onBlur(e) {
    this.setState({
      showTip: false
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    for (var index in this.state) {
      if (this.state[index] !== nextState[index]) {
        return true;
      }
    }
    return false;
  }

  render() {
    var props = this.props,
      state = this.state;

    var checkStatus = function() {
      if(state.error) {
        return 'error';
      } else if(state.loading) {
        return 'login-loading';
      } else if(state.pass) {
        return 'login-pass';
      } else {
        return '';
      }
    };

    return (
      <div className={'halo-com-login-input ' + checkStatus()}>
        {
          props.tip && state.tipContent ?
            <div className="tip-bottom">
              <Tooltip content={state.tipContent} width={214} type={state.error ? 'error' : ''} shape="top-left" hide={!state.showTip || state.pass} />
            </div>
          : null
        }
        <input
          placeholder={props.placeholder}
          type={props.input_type}
          onFocus={props.tip ? this.onFocus : null}
          onBlur={props.tip ? this.onBlur : null}
          onChange={this.onChange.bind(this, props.name)}
          autoFocus={props.name === 'email' ? 'autofocus' : null}
          autoComplete="off" />
        <i className={checkStatus() === 'login-pass' ? 'glyphicon icon-active-yes' : 'glyphicon icon-loading'}></i>
      </div>
    );
  }
}

module.exports = Input;
