require('../../style/index.less');

var React = require('react');

class EditContent extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      content: this.props.item.content,
      value: this.props.item.content,
      edit: false
    };

    this.onChangeInput = this.onChangeInput.bind(this);
    this.editable = this.editable.bind(this);
    this.onEdit = this.onEdit.bind(this);
    this.onCancel = this.onCancel.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      content: nextProps.item.content,
      value: nextProps.item.content,
      edit: false
    });
  }

  onChangeInput(e) {
    this.setState({
      value: e.target.value
    });
  }

  editable(status) {
    this.setState({
      edit: status
    });
  }

  onEdit() {
    this.editable(true);
  }

  onKeyPressInput(e) {
    if (e.key === 'Enter') {
      this.onConfirm(e);
    }
  }

  onConfirm(e) {
    var item = this.props.item;
    this.props.onAction && this.props.onAction('edit_name', {
      item: item,
      newName: this.state.value
    });
  }

  onCancel() {
    this.editable(false);
    this.setState({
      value: this.props.item.content
    });
  }

  render() {
    var state = this.state,
      value = state.value,
      edit = state.edit,
      content = state.content;

    return (
      edit ?
        <span>
          <input value={value} onChange={this.onChangeInput} onKeyPress={this.onKeyPressInput.bind(this)} />
          <i className="glyphicon icon-delete edit-confirm" onClick={this.onConfirm.bind(this)} />
          <i className="glyphicon icon-remove edit-cancel" onClick={this.onCancel} />
        </span>
      : <span>
          {content}
          <i className="glyphicon icon-edit remodify" onClick={this.onEdit} />
        </span>
    );
  }

}

module.exports = EditContent;
