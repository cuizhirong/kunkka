const React = require('react');
const {Button} = require('client/uskin/index');

class StringItem extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: props.data.value ? props.data.value : '',
      data: props.data,
      error: false
    };

    this.onChange = this.onChange.bind(this);
  }

  onChange(e) {
    this.setState({
      value: e.target.value,
      error: !e.target.value
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

    return (
      <li className="string-item-wrapper">
        <div className="name" title={state.data.metadata_name}>
          {state.data.metadata_name}
        </div>
        <div className="string-wrapper">
          <input className={state.error ? 'error' : ''} type="text" value={state.value} onChange={this.onChange} />
        </div>
        <Button iconClass="delete" initial={true} type="delete" onClick={this.remove.bind(this, state.data)}/>
      </li>
    );
  }
}

module.exports = StringItem;
