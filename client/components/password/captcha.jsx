const React = require('react');
const {Modal, Button} = require('client/uskin/index');

class ModalBase extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      img_url: '',
      captcha: '',
      formatWrongMsg: ''
    };

    ['onCancel', 'onChangeImg', 'onChangeCaptcha', 'onConfirm'].forEach((func) => {
      this[func] = this[func].bind(this);
    });
  }

  componentWillMount() {
    const random = Date.now().toString().slice(-6);
    this.setState({
      img_url: '/api/captcha?' + random
    });
  }

  onChangeImg(e) {
    e.preventDefault();
    const random = Date.now().toString().slice(-6);
    this.setState({
      img_url: '/api/captcha?' + random
    });
  }

  onChangeCaptcha(e) {
    this.setState({
      captcha: e.target.value
    });
  }

  onCancel() {
    this.setState({
      visible: false
    });
  }

  onConfirm() {
    const reg = /^\w{6}$/;
    if(!reg.test(this.state.captcha)) {
      this.setState({
        formatWrongMsg: this.props.obj.__.wrong_captcha_format
      });
      return;
    }

    this.props.callback(this.state.captcha);
    this.onCancel();
  }

  render() {
    const props = this.props;
    const state = this.state;
    const __ = props.obj.__;

    return (
      <Modal ref="modal" {...props} width={420} title={ __.get_sms_captcha } visible={state.visible} >
        <div className="modal-bd halo-com-modal-personal-info-captcha">
          <div className="img-wrapper">
            <img onClick={this.onChangeImg} src={state.img_url} />
          </div>
          <input onChange={this.onChangeCaptcha} type="text" value={state.captcha} />
          <div className="format-wrong-tip">{ state.formatWrongMsg }</div>
        </div>
        <div className="modal-ft">
          <div>
            <div className="right-side">
              <Button value={ __.confirm } onClick={ this.onConfirm } type="create" />
              <Button value={ __.cancel } onClick={ this.onCancel } type="cancel" />
            </div>
          </div>
        </div>
      </Modal>
    );
  }
}

module.exports = ModalBase;
