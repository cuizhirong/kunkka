require('./style/index.less');

const React = require('react');
const {Modal, Button, Tip} = require('client/uskin/index');
const __ = require('locale/client/admin.lang.json');
const request = require('../../request');

const getErrorMessage = require('../../../../utils/error_message');
const getOsCommonName = require('client/utils/get_os_common_name');

class BatchReactivate extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: true,
      errorMessage: '',
      btnDisabled: false
    };
    this.onReactivate = this.onReactivate.bind(this);
    this.onCancel = this.onCancel.bind(this);
  }

  onCancel() {
    this.setState({
      visible: false
    });
  }

  onReactivate(){
    const callback = this.props.callback;
    this.setState({
      btnDisabled: true
    });
    request.reactivateImages(this.props.obj.images).then(() => {
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
      <Modal refs="modal" {...props} title={__.reactivate} visible={state.visible} onCancel={this.onCancel} onConfirm={this.onReactivate}>
        <div className="modal-bd halo-com-modal-reactivate-images">
          <div className="content-wrapper">
            <div className="modal-content-title">
              { __.confirm_reactivate }
            </div>
            <ul className="modal-content">
              {
                props.obj.images.map((image) => {
                  return (
                    <li key={image.id}>
                      { _this.getImageIcon(image) }
                      <span>
                        { image.name }
                      </span>
                    </li>
                  );
                })
              }
            </ul>
            <div className={'error-wrapper' + (state.errorMessage ? '' : ' hide')}>
              <Tip content={state.errorMessage} showIcon={true} type={'danger'} />
            </div>
          </div>
        </div>
        <div className="modal-ft">
          <div className="right-side">
            <Button ref="btn" value={__.confirm} onClick={this.onReactivate} type="create" disabled={state.btnDisabled} />
            <Button value={__.cancel} onClick={this.onCancel} type="cancel" />
          </div>
        </div>
      </Modal>
    );
  }
}

module.exports = BatchReactivate;
