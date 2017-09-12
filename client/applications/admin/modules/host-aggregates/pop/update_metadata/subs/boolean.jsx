const React = require('react');
const {Button} = require('client/uskin/index');

class BooleanItem extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: props.data.value ? props.data.value.toString() : 'false',
      data: props.data,
      error: false
    };

    this.onChange = this.onChange.bind(this);
  }

  onChange(e) {
    this.setState({
      value: e.target.checked.toString()
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    for (let index in this.state) {
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
    let state = this.state;
    let checked = state.value === 'true' ? true : false;

    return (
      <li className="boolean-item-wrapper">
        <div className="name" title={state.data.metadata_name}>
          {state.data.metadata_name}
        </div>
        <div className="boolean-wrapper">
          <input type="checkbox" checked={checked} onChange={this.onChange} />
        </div>
        <Button iconClass="delete" initial={true} type="delete" onClick={this.remove.bind(this, state.data)}/>
      </li>
    );
  }
}

module.exports = BooleanItem;
