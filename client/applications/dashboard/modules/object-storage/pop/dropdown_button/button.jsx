const React = require('react');

class Button extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      disabled: false,
      hide: false
    };

    ['onClick'].forEach((func) => {
      this[func] = this[func].bind(this);
    });

  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.disabled !== this.props.disabled) {
      this.setState({
        disabled: nextProps.disabled
      });
    }
  }

  onClick(e) {
    this.props.onClick(e, this.props.btnKey);
  }

  render() {
    const props = this.props;
    const state = this.state;
    return (
      !state.hide ? <div className="defined-btn" onClick={!state.disabled ? this.onClick : null}>
        {props.value ? <span>{props.value}</span> : null}

      </div> : null
    );
  }
}

Button.defaultProps = {
  disabled: false,
  hide: false
};

module.exports = Button;
