const React = require('react');
const {Button} = require('client/uskin/index');

class InputText extends React.Component {
  constructor(props) {
    super(props);

    let initValue = '';

    if(props.propValue !== undefined) {
      initValue = props.propValue;
    } else if(props.default !== undefined) {
      initValue = props.default;
    }

    this.state = {
      value: initValue
    };

    this.onChange = this.onChange.bind(this);
  }

  componentDidMount() {
    const props = this.props;
    props.onPropValueChange(props.propKey, this.state.value);
  }

  onChange(evt) {
    const value = evt.target.value;
    const props = this.props;
    props.onPropValueChange(props.propKey, value);
    this.setState({
      value: value
    });
  }

  render() {
    return (
      <div onClick={this.props.showDescription}>
        <span className="meta-title" alt={this.props.propKey}>
          {this.props.propKey}
        </span>
        <input value={this.state.value} onChange={this.onChange} className="input-text" type="text"/>
        <Button {...this.props.btnConfig} />
      </div>
    );
  }
}

module.exports = InputText;
