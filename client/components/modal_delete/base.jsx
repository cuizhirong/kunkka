var React = require('react');
var {Modal, Button} = require('client/uskin/index');


class ModalBase extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      disabled: false,
      isClose: true
    };

    this.onDelete = this.onDelete.bind(this);
    this.onCancel = this.onCancel.bind(this);
  }

  onDelete() {
    this.setState({
      disabled: true
    });
    this.props.onDelete && this.props.onDelete(this.state, (status) => {
      if (status) {
        this.setState({
          visible: false
        });
      } else {
        this.setState({
          disabled: false
        });
      }

    });
  }

  onCancel() {
    this.setState({
      visible: false
    });
    this.props.onCancel && this.props.onCancel();
  }

  render() {
    var props = this.props,
      state = this.state;

    return (
      <Modal {...props} visible={state.visible} isClose={state.isClose}>
        <div className="modal-bd">
          {props.content}
        </div>
        <div className="modal-ft">
          <Button value={props.deleteText} disabled={state.disabled} btnKey="create" type="delete" onClick={this.onDelete}/>
          <Button value={props.CancelText} btnKey="cancel" type="cancel" onClick={this.onCancel}/>
        </div>
      </Modal>
    );
  }
}

module.exports = ModalBase;
