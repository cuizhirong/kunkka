var React = require('react');

class Input extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
      disabled: false
    };

    this.onChange = this.onChange.bind(this);
  }

  componentWillMount() {
    this.setState({
      disabled: this.props.disabled,
      value: this.props.value
    });
  }

  onChange(e) {
    this.setState({
      value: e.target.value
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.value === nextState.value && this.state.disabled === nextState.disabled) {
      return false;
    }
    return true;
  }

  componentDidUpdate() {
    this.props.onAction(this.props.field, this.state);
  }

  render() {
    return (
      <div className="row">
        <input type={this.props.input_type} disabled={this.state.disabled} onChange={this.onChange} value={this.state.value} />
      </div>
    );
  }
}

module.exports = Input;
