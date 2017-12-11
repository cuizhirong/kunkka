const React = require('react');
const {Button} = require('client/uskin/index');

class Checkbox extends React.Component {
  constructor(props) {
    super(props);

    let initValue = false;

    if (props.propValue !== undefined) {
      initValue = props.propValue === 'true' ? true : false;
    } else if (props.default !== undefined) {
      initValue = props.default === 'true' ? true : false;
    }

    this.state = {
      checked: initValue
    };
    this.onChange = this.onChange.bind(this);
  }

  componentDidMount() {
    const props = this.props;

    props.onPropValueChange(props.propKey, this.state.checked);
  }

  onChange(evt) {
    const checked = evt.target.checked;
    const props = this.props;

    props.onPropValueChange(props.propKey, checked);

    this.setState({
      checked: checked
    });
  }

  render() {
    return (
      <div onClick={this.props.showDescription}>
        <span className="meta-title" alt={this.props.propKey}>
          {this.props.propKey}
        </span>
        <input checked={this.state.checked} onChange={this.onChange} className="input-checkbox" type="checkbox" />
        <Button {...this.props.btnConfig} />
      </div>
    );
  }
}

module.exports = Checkbox;
