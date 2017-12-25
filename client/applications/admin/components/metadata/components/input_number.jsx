const React = require('react');
const {InputNumber, Button} = require('client/uskin/index');

class NumberInput extends React.Component {
  constructor(props) {
    super(props);

    let initValue = 0;

    if (props.propValue !== undefined) {
      initValue = Number(props.propValue);
    } else if (props.default !== undefined) {
      initValue = Number(props.default);
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

  onChange(val, evt) {
    const props = this.props;

    if(isNaN(Number(val)) || val === '') {
      if(props.default) {
        val = Number(props.default);
      } else if(props.minimum) {
        val = props.minimum;
      } else if(props.maximun) {
        val = props.maximun;
      } else {
        val = 0;
      }
    } else {
      val = parseInt(val, 10);
    }

    props.onPropValueChange(props.propKey, val);

    this.setState({
      value: val
    });
  }

  render() {
    let props = this.props;

    return (
      <div onClick={this.props.showDescription}>
        <span className="meta-title" alt={this.props.propKey}>
          {this.props.propKey}
        </span>
        <InputNumber min={props.minimum} max={props.maximun} value={this.state.value} step={1} onChange={this.onChange} width={122} />
        <Button {...this.props.btnConfig} />
      </div>
    );
  }
}

module.exports = NumberInput;
