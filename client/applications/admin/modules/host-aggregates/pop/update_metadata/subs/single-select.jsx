var React = require('react');
var {Button} = require('client/uskin/index');

class SingleSelect extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: props.data.value ? props.data.value : props.data.enum[0],
      data: props.data,
      error: false
    };

    this.onChange = this.onChange.bind(this);
  }

  onChange(e) {
    this.setState({
      value: e.target.value
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
      <li className="select-item-wrapper">
        <div className="name" title={state.data.metadata_name}>
          {state.data.metadata_name}
        </div>
        <div className="select-wrapper">
          <select value={state.value} onChange={this.onChange}>
            {
              state.data.enum.map(function(v) {
                return <option key={v} value={v}>{v}</option>;
              })
            }
          </select>
        </div>
        <Button iconClass="delete" initial={true} type="delete" onClick={this.remove.bind(this, state.data)}/>
      </li>
    );
  }
}

module.exports = SingleSelect;
