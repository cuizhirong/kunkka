require('./style/index.less');

var React = require('react');

class EditContent extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      content: this.props.item.content,
      value: this.props.item.content,
      edit: false,
      isDelete: this.props.item.isDelete
    };

    this.onChangeInput = this.onChangeInput.bind(this);
    this.editable = this.editable.bind(this);
    this.onEdit = this.onEdit.bind(this);
    this.onCancel = this.onCancel.bind(this);
    this.onDelete = this.onDelete.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      content: nextProps.item.content,
      value: nextProps.item.content,
      edit: false,
      className: ''
    });
  }

  onChangeInput(e) {
    var regex = /^[0-9.]{1,}$/;
    this.setState({
      value: e.target.value,
      className: ''
    });
    if(!regex.exec(e.target.value)) {
      this.setState({
        className: 'error'
      });
    }
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
    this.props.onAction && this.props.onAction(item.actionType, {
      item: item,
      newValue: this.state.value
    });
  }

  onCancel() {
    this.editable(false);
    this.setState({
      value: this.props.item.content
    });
  }

  onDelete() {
    var deleteItem = this.props.deleteItem;
    var index = this.props.item.index;
    this.props.onAction && this.props.onAction(deleteItem, {
      index: index
    });
  }

  render() {
    var state = this.state,
      value = state.value,
      edit = state.edit,
      content = state.content,
      className = state.className,
      isDelete = state.isDelete;

    return (
      edit ?
        <div className="halo-price-edit">
          <input value={value} className={className} onChange={this.onChangeInput} onKeyPress={this.onKeyPressInput.bind(this)} />
          <i className="glyphicon icon-active edit-confirm" onClick={this.onConfirm.bind(this)} />
          <i className="glyphicon icon-remove edit-cancel" onClick={this.onCancel} />
          {isDelete ? <i className="glyphicon icon-remove edit-delete" onClick={this.onDelete} /> : ''}
        </div>
      : <div className="halo-price-edit">
          {content}
          <i className="glyphicon icon-edit remodify" onClick={this.onEdit} />
          {isDelete ? <i className="glyphicon icon-remove edit-delete" onClick={this.onDelete} /> : ''}
        </div>
    );
  }

}

module.exports = EditContent;
