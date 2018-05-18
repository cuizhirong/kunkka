const React = require('react');
const {Modal, Button} = require('client/uskin/index');
const __ = require('locale/client/dashboard.lang.json');
const copylink = require('clipboard-plus');

class ModalBase extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: true
    };

    ['onCancel', 'onConfirm'].forEach((f)=> {
      this[f] = this[f].bind(this);
    });
  }

  onCancel() {
    this.setState({
      visible: false
    });
  }

  onConfirm() {
    if(this.refs.btn.state.disabled) {
      return;
    }
    copylink(this.props.temporaryUrl);
    this.setState({
      visible: false
    });
    this.props.callback && this.props.callback();
  }

  render() {
    let props = this.props,
      state = this.state;
    return (
      <Modal refs="modal" {...props} visible={state.visible} width={510} onCancel={this.onCancel} onConfirm={this.onConfirm}>
        <div className="object-temporary-url-tip">
          <div className="modal-hd">
            <h6 className="title">{__.copy + __.temporary_url}</h6>
            <span className="glyphicon icon-close" onClick={this.onCancel.bind(this)}></span>
          </div>
          <div className="modal-bd">
            <p className="temurl">{props.temporaryUrl}</p>
            <div className="tip obj-tip-warning">
              <div className="obj-tip-icon">
                <strong>
                  <i className="glyphicon icon-status-warning" />
                </strong>
              </div>
              <div className="obj-tip-content" style={{width: 320 + 'px'}}>
                {__.temporary_url_tip}
              </div>
            </div>
          </div>
          <div className="modal-ft halo-com-temporary-url-tip">
            <Button ref="btn" value={__.copy} disabled={false} onClick={this.onConfirm} />
            <Button value={__.cancel} onClick={this.onCancel} type="cancel" />
          </div>
        </div>
      </Modal>
    );
  }
}

module.exports = ModalBase;
