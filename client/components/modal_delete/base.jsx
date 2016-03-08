var React = require('react');
var {Modal, Button} = require('client/uskin/index');
var __ = require('i18n/client/lang.json');


class ModalBase extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      disabled: false
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
      state = this.state,
      action = __[props.action],
      type = __[props.type],
      num = props.data.length,
      cancel = __.cancel,
      content = __.msg_delete.replace('{0}', action).replace('{1}', type).replace('{2}', num);

    var _props = Object.assign({}, props, {
      title: action + type
    });

    var iconType = props.iconType || props.type.replace('_', '-');

    return (
      <Modal {..._props} visible={state.visible}>
        <div className="modal-bd halo-com-modal-delete">
          {content}
          <div className="data-list">
            {
              props.data.map((item) => {
                return <span key={item.id}><i className={'glyphicon icon-' + iconType}></i>{item.name}</span>;
              })
            }
          </div>
        </div>
        <div className="modal-ft">
          <Button value={action} disabled={state.disabled} btnKey="create" type="delete" onClick={this.onDelete}/>
          <Button value={cancel} btnKey="cancel" type="cancel" onClick={this.onCancel}/>
        </div>
      </Modal>
    );
  }
}

module.exports = ModalBase;
