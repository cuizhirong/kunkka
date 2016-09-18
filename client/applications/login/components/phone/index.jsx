let React = require('react');
let request = require('../../request.js');
let getErrorMessage = require('../../utils/error_message.js');
let Tooltip = require('client/uskin/index').Tooltip;
require('./style/index.less');

class Phone extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      textValue: this.props.__.getCode,
      pass: false,
      error: false,
      wait: false,
      tipContent: null
    };
  }

  onClick() {
    let count = 60,
      timer,
      state = this.state,
      __ = this.props.__;

    request.getVerification(state.value).then(() => {
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
            textValue: this.props.__.getCode,
            wait: false
          });
          clearInterval(timer);
        }
      }, 1000);
    }).catch((err) => {
      this.setState({
        error: true,
        pass: false,
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

  render() {
    let props = this.props,
      state = this.state,
      __ = this.props.__,
      isDisabled = function() {
        if(!state.wait) {
          if(state.pass) {
            return '';
          }
          return 'disabled';
        }
        return 'disabled';
      };

    return (
      <div className="phone-number">
        <div className="tip-bottom">
          <Tooltip content={state.tipContent} width={110} type={'error'} shape="top-left" hide={!state.tipContent} />
        </div>
        <input type="text" className={state.error ? 'error' : ''} ref="phone" name="phone" placeholder={__.phone_placeholder} autoComplete="off" onChange={this.onChange.bind(this, props.name)} />
        <i className={state.pass ? 'glyphicon icon-active-yes show' : ''}></i>
        <input ref="send" type="button" disabled={isDisabled()} value={state.textValue} onClick={this.onClick.bind(this)} />
      </div>
    );
  }
}

module.exports = Phone;
