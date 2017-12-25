const React = require('react');
const {DropdownButton, Button} = require('client/uskin/index');

class Select extends React.Component {
  constructor(props) {
    super(props);

    const items = this.props.enum.map((item) => {
      return {
        title: item,
        key: item
      };
    });

    items.sort((a, b) => {
      return a.title.localeCompare(b.title);
    });

    let initValue;

    if (props.propValue !== undefined) {
      initValue = props.propValue;
    } else if (props.default !== undefined) {
      initValue = props.default;
    } else {
      initValue = items[0].key;
    }

    const config = {
      buttonData: {
        value: initValue
      },
      dropdownStyle: {
        minWidth: 100,
        width: 150
      },
      dropdownItems: [
        {
          key: this.props.propKey,
          items: items
        }
      ],
      dropdownOnClick: this.onClick.bind(this)
    };

    this.state = {
      value: initValue,
      btnConfig: config
    };
  }

  componentDidMount() {
    const props = this.props;
    props.onPropValueChange(props.propKey, this.state.value);
  }


  onClick(evt, item) {
    const btnConfig = this.state.btnConfig;
    btnConfig.buttonData.value = item.title;

    const props = this.props;
    props.onPropValueChange(props.propKey, item.key);

    this.setState({
      value: item.key,
      btnConfig: btnConfig
    });
  }

  render() {

    return (
      <div onClick={this.props.showDescription}>
        <span className="meta-title" alt={this.props.propKey}>
          {this.props.propKey}
        </span>
        <DropdownButton {...this.state.btnConfig} />
        <Button {...this.props.btnConfig} />
      </div>
    );
  }
}

module.exports = Select;
