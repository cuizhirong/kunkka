import React, {PropTypes} from 'react';

class DropIcon extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      hide: false,
      disabled: false
    };

    ['onClick'].forEach((func) => {
      this[func] = this[func].bind(this);
    });
  }

  onClick(e) {
    this.props.onClick(e, this.props.btnKey);
  }

  render() {
    const props = this.props;
    const state = this.state;

    return (
      !state.hide ? <div className="defined-icon"
        disabled={state.disabled}
        onClick={!state.disabled ? this.onClick : null}
      >
        {props.dropdown ? <i className="glyphicon icon-dropdown defined-icon-dropdown" /> : null}
      </div> : null
    );
  }

}

DropIcon.propTypes = {
  onClick: PropTypes.func,
  value: PropTypes.string,
  btnKey: PropTypes.string,
  disabled: PropTypes.bool,
  dropdown: PropTypes.bool,
  hide: PropTypes.bool
};

DropIcon.defaultProps = {
  dropdown: false
};

export default DropIcon;
