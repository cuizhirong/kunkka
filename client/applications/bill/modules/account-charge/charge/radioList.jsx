require('./style/index.less');

var React = require('react');

class Main extends React.Component {
  constructor(props) {
    super(props);

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e) {
    this.props.onSelectedValueChanged && this.props.onSelectedValueChanged(e);
  }

  render() {
    var props = this.props;

    return (
      <div className="p-r">
        <input type="radio"
          id={props.id}
          name={props.name}
          value={props.value}
          checked={props.checked}
          onChange={this.handleChange}/>
        <label htmlFor={props.id}>
          <i style={props.styleClass} />
        </label>
      </div>
    );
  }
}

module.exports = Main;
