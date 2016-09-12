var React = require('react');

class Adapter extends React.Component {
  constructor(props) {
    super(props);

    this.state = Object.assign({
      renderer: props.renderer,
      field: props.field,
      value: props.value ? props.value : '',
      required: props.required,
      disabled: !!props.disabled,
      hide: !!props.hide,
      error: false,
      onChange: this.onChange.bind(this)
    }, this.props);
  }

  onChange(value) {
    this.setState({
      value: value
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    for (var index in this.state) {
      if (this.state[index] !== nextState[index]) {
        return true;
      }
    }
    return false;
  }

  componentDidUpdate() {
    this.props.onAction(this.props.field, this.state);
  }

  render() {
    var state = this.state;
    return (
      this.state.renderer ? this.state.renderer(state) : <div>no info</div>
    );
  }
}

module.exports = Adapter;
