const React = require('react');
const {Modal, Button} = require('client/uskin/index');
const __ = require('locale/client/register.lang.json');
// let getErrorMessage = require('../../../../utils/error_message');

const TITLE = __.captcha;

class ModalBase extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      img_url: '',
      captcha: ''
    };

    this.mask = document.querySelector('.modal-mask');

    ['onCancel', 'onChangeImg', 'onChangeCaptcha', 'onConfirm'].forEach((func) => {
      this[func] = this[func].bind(this);
    });
  }

  componentWillMount() {
    this.setState({
      img_url: '/api/captcha?' + Math.random()
    });
  }

  onChangeImg(e) {
    e.preventDefault();
    this.setState({
      img_url: '/api/captcha?' + Math.random()
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
    this.props.callback(this.state.captcha);
    this.onCancel();
  }

  render() {
    let props = this.props;
    let state = this.state;

    return (
      <Modal ref="modal" {...props} width={420} title={TITLE} visible={state.visible}>
        <div className="modal-bd halo-com-modal-captcha">
          <div className="img-wrapper">
            <img onClick={this.onChangeImg} src={state.img_url} />
          </div>
          <input onChange={this.onChangeCaptcha} type="text" value={state.captcha} />
        </div>
        <div className="modal-ft halo-com-modal-captcha">
          <div>
            <div className="right-side">
              <Button value={__.confirm} onClick={this.onConfirm} type="create" />
              <Button value={__.cancel} onClick={this.onCancel} type="cancel" />
            </div>
          </div>
        </div>
      </Modal>
    );
  }
}

module.exports = ModalBase;
