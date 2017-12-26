require('./style/index.less');
const React = require('react');
const DropIcon = require('./dropicon.jsx');
const Dropdown = require('./dropdown.jsx');
const Button = require('./button.jsx');

class DropdownButton extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      toggle: false
    };

    ['buttonOnClick', 'closeToggle', 'onClick'].forEach((func) => {
      this[func] = this[func].bind(this);
    });
  }

  buttonOnClick(e, key) {
    let toggle = this.state.toggle;

    if (toggle) {
      e.stopPropagation();
      this.closeToggle(e);
    } else {
      this.setState({
        toggle: true
      });

      document.addEventListener('click', this.closeToggle);
    }
  }

  closeToggle(e) {
    this.setState({
      toggle: false
    });

    document.removeEventListener('click', this.closeToggle);
  }

  onClick(item) {
    this.props.dropdownOnClick(item);
  }

  render() {
    const props = this.props;
    const btn = props.buttonData;
    const dropdownItems = props.dropdownItems;
    let dropdownStyle = props.dropdownStyle ?
      Object.assign({}, props.dropdownStyle) : {width: 81};
    dropdownStyle.display = this.state.toggle ? 'block' : 'none';

    return (
      <div ref="dropdownBtn" className="defined-dropdown-btn">
        <Button value={btn.value}
        onClick={props.mainButtonClick}/>
        <DropIcon
          iconClass={btn.iconClass}
          onClick={this.buttonOnClick}
          dropdown={true}
          initial={true}
          disabled={props.disabled} />
        <Dropdown items={dropdownItems}
          style={dropdownStyle}
          onClick={this.onClick} />
      </div>
    );
  }

}

DropdownButton.defaultProps = {
  dropdownItems: [],
  disabled: false
};

module.exports = DropdownButton;
