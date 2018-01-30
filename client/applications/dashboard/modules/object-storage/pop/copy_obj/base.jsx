const React = require('react');
const __ = require('locale/client/dashboard.lang.json');
const {Modal, Button} = require('client/uskin/index');

class ModalBase extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: true
    };
  }

  onCancel() {
    this.setState({
      visible: false
    });
  }

  render() {
    let props = this.props,
      state = this.state;
    return (
      <Modal refs="modal" {...props} visible={state.visible}>
        <div className="object-storage-description">
          <div className="modal-hd">
          <h6 className="title">{__.copy + __.file}</h6>
          <span className="glyphicon icon-close" onClick={this.onCancel.bind(this)}></span>
        </div>
        <div className="modal-bd">
          <p>{__.copy_obj_success}</p>
        </div>
        <div className="modal-ft">
          <Button value={__.confirm} onClick={this.onCancel.bind(this)} />
        </div>
        </div>
      </Modal>
    );
  }
}

module.exports = ModalBase;
