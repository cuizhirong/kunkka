var React = require('react');

class Checkbox extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      checked: !!props.checked,
      hide: !!props.hide
    };

    this.onChange = this.onChange.bind(this);
  }

  onChange(e) {
    this.setState({
      checked: !this.state.checked
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.checked === nextState.checked && this.state.hide === nextState.hide) {
      return false;
    }
    return true;
  }

  componentDidUpdate() {
    this.props.onAction(this.props.field, this.state);
  }

  render() {
    var className = this.state.hide ? 'modal-row checkbox-row hide' : 'modal-row checkbox-row';

    return (
      <div className={className}>
        <input type="checkbox" onChange={this.onChange} checked={this.state.checked} />
        <label onClick={this.onChange}>{this.props.label}</label>
      </div>
    );
  }
}

module.exports = Checkbox;
