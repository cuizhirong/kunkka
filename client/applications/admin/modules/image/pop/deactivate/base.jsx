require('./style/index.less');
const React = require('react');
const {Modal, Button, Tip} = require('client/uskin/index');
const __ = require('locale/client/admin.lang.json');
const request = require('../../request');

const getErrorMessage = require('../../../../utils/error_message');
const getOsCommonName = require('client/utils/get_os_common_name');

class Deactivate extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: true,
      errorMessage: '',
      btnDisabled: false
    };
    this.onDeactivate = this.onDeactivate.bind(this);
    this.onCancel = this.onCancel.bind(this);
  }

  onCancel() {
    this.setState({
      visible: false
    });
  }

  onDeactivate(){
    const callback = this.props.callback;
    this.setState({
      btnDisabled: true
    });
    request.deactivateImage(this.props.obj.image.id).then(() => {
      this.onCancel();
      callback && callback();
    }).catch((err) => {
      this.setState({
        btnDisabled: false,
        errorMessage: getErrorMessage(err)
      });
    });
  }

  getImageIcon(image) {
    let label = getOsCommonName(image);
    let style = null;

    let imgURL = HALO.settings.default_image_url;
    if (imgURL) {
      style = {
        background: `url("${imgURL}") 0 0 no-repeat`,
        backgroundSize: '20px 20px'
      };
    }
    return (
      <i className={'icon-image-default ' + label} style={style}/>
    );
  }

  render() {
    let props = this.props,
      state = this.state;
    const _this = this;
    return (
      <Modal refs="modal" {...props} title={__.deactivate_image} visible={state.visible}>
        <div className="modal-bd halo-com-modal-deactivate-image">
          <div className="content-wrapper">
            <div className="modal-content-title">
              { __.confirm_deactivate }
            </div>
            <div className="modal-content">
              <div>
                { _this.getImageIcon(props.obj.image) }
                <span>{ props.obj.image.name }</span>
              </div>
            </div>
            <div className={'error-wrapper' + (state.errorMessage ? '' : ' hide')}>
              <Tip content={state.errorMessage} showIcon={true} type={'danger'} />
            </div>
          </div>
        </div>
        <div className="modal-ft">
          <div className="right-side">
            <Button ref="btn" value={__.confirm} onClick={this.onDeactivate} type="create" disabled={state.btnDisabled} />
            <Button value={__.cancel} onClick={this.onCancel} type="cancel" />
          </div>
        </div>
      </Modal>
    );
  }
}

module.exports = Deactivate;
