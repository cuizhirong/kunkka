var React = require('react');
var {Modal, Button} = require('client/uskin/index');
var deleteModal = require('client/components/modal_delete/index');


class ModalBase extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      disabled: false
    };

    this.onConfirm = this.onConfirm.bind(this);
    this.onCancel = this.onCancel.bind(this);
    this.onPop = this.onPop.bind(this);
  }

  onConfirm() {
    this.setState({
      disabled: true
    });
    this.props.onConfirm && this.props.onConfirm(this.state, (status) => {
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

  onPop() {
    deleteModal({
      title: '删除通用弹窗测试',
      content: '测试，这是内容区域',
      deleteText: '删除',
      cancelText: '取消',
      onDelete: function(data, cb) {
        console.log('触发删除事件:', data);
        setTimeout(function() {
          cb(true);
        }, 1000);
      },
      parent: this.refs.modal
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
      <Modal ref="modal" {...props} visible={state.visible}>
        <div className="modal-bd">
          <a onClick={this.onPop}>点击我</a>
        </div>
        <div className="modal-ft">
          <Button value={props.confirmText} disabled={state.disabled} onClick={this.onConfirm}/>
          <Button value={props.cancelText} btnKey="cancel" type="cancel" onClick={this.onCancel}/>
        </div>
      </Modal>
    );
  }
}

module.exports = ModalBase;
