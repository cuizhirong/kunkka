const React = require('react');
const request = require('../../request.js');
const getErrorMessage = require('../../utils/error_message.js');
const Tooltip = require('client/uskin/index').Tooltip;
const pop = require('../captcha/index');
require('./style/index.less');

class Phone extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      textValue: this.props.__.getCode,
      code: '',
      pass: false,
      error: false,
      wait: false,
      tipContent: null,
      sysError: false
    };
  }

  onClick() {
    const that = this;
    pop(null, null, function(res) {
      that.setState({
        captcha: res
      }, () => {
        that.onSubmit(res);
      });
    });
  }

  onSubmit(captcha) {
    let count = 60,
      timer,
      state = this.state,
      __ = this.props.__;

    this.setState({
      wait: true,
      textValue: __.sending
    });

    request.getVerification(state.value, captcha).then(() => {
      this.setState({
        wait: true,
        textValue: __.sendAgain.replace('{0}', count),
        tipContent: null
      });
      timer = setInterval(() => {
        if(count > 0) {
          this.setState({
            textValue: __.sendAgain.replace('{0}', count--)
          });
        } else {
          this.setState({
            textValue: __.getCode,
            wait: false
          });
          clearInterval(timer);
        }
      }, 1000);
    }).catch((err) => {
      let code = err.status;
      this.setState({
        sysError: code >= 500 ? true : false,
        wait: false,
        error: true,
        pass: false,
        textValue: __.getCode,
        tipContent: getErrorMessage(err)
      });
    });
  }

  onChange(type, e) {
    let value = e.target.value;
    this.setState({
      value: value
    });
    this.props.onChange && this.props.onChange(type, value);
  }

  onChangeCode(e) {
    let value = e.target.value;
    this.setState({
      code: value
    });
    this.props.onChange && this.props.onChange('code', value);
  }

  render() {
    let props = this.props,
      state = this.state,
      __ = this.props.__,
      isDisabled = state.wait || (!state.wait && !state.pass && !state.sysError);

    return (
      <div className="phone-number">
        <div className="tip-bottom">
          <Tooltip content={state.tipContent} width={110} type={'error'} shape="top-left" hide={!state.tipContent} />
        </div>
        <input type="text" className={state.error ? 'error' : ''} ref="phone" name="phone" placeholder={__.phone_placeholder} autoComplete="off" onChange={this.onChange.bind(this, props.name)} />
        <i className={state.pass ? 'glyphicon icon-active-yes show' : ''}></i>
        <input type="text" className="code-test" name="code" ref="code" placeholder={__.code_placeholder} onChange={this.onChangeCode.bind(this)} />
        <input ref="send" type="button" disabled={isDisabled ? 'disabled' : ''} value={state.textValue} onClick={this.onClick.bind(this)} />
      </div>
    );
  }
}

module.exports = Phone;
