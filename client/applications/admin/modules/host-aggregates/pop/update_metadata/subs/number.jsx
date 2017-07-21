var React = require('react');
var {Button, InputNumber} = require('client/uskin/index');

class NumberItem extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: props.value ? props.value : 0,
      data: props.data,
      error: false
    };

    this.onChange = this.onChange.bind(this);
  }

  onChange(value, error) {
    this.setState({
      value: value,
      error: error
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

  remove(item) {
    this.props.onRemove && this.props.onRemove(item, false);
  }

  render() {
    var state = this.state;

    return (
      <li className="number-item-wrapper">
        <div className="name" title={state.data.metadata_name}>
          {state.data.metadata_name}
        </div>
        <div className="input-wrapper">
          <InputNumber onChange={this.onChange} value={state.value} width={110} />
        </div>
        <Button iconClass="delete" initial={true} type="delete" onClick={this.remove.bind(this, state.data)}/>
      </li>
    );
  }
}

module.exports = NumberItem;
