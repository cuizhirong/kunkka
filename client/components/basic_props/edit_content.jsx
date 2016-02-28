require('../../style/index.less');

var React = require('react');
var Request = require('client/dashboard/cores/request');

class EditContent extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      content: this.props.item.content,
      value: this.props.item.content,
      edit: false
    };

    this.inputOnChange = this.inputOnChange.bind(this);
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

  inputOnChange(e) {
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

  onConfirm(item, e) {
    var r = item.request;
    var data = {};
    data[r.body] = {};
    data[r.body][r.modifyData] = this.state.value;

    Request.put({
      url: r.url,
      data: data
    }).then((res) => {
      this.props.dashboard.refresh();
      this.props.dashboard.refs.captain.forceUpdate();
    }, (err) => {
      // console.log('err', err);
    });
  }

  onCancel() {
    this.editable(false);
    this.setState({
      value: this.props.item.content
    });
  }

  render() {
    var item = this.props.item,
      value = this.state.value,
      edit = this.state.edit,
      content = this.state.content;

    return (
      edit ?
        <span>
          <input value={value} onChange={this.inputOnChange} />
          <i className="glyphicon icon-delete edit-confirm" onClick={this.onConfirm.bind(this, item)} />
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
