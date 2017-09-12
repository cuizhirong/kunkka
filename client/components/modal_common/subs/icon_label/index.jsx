const React = require('react');

class IconLabel extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: props.text,
      hide: !!props.hide
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.hide === nextState.hide && this.state.value === nextState.value) {
      return false;
    }
    return true;
  }

  componentDidUpdate() {
    this.props.onAction(this.props.field, this.state);
  }

  render() {
    let props = this.props;
    let className = 'modal-row icon-label-row';
    if (props.is_long_label) {
      className += ' label-row long-label-row';
    } else {
      className += ' label-row';
    }
    if (this.state.hide) {
      className += ' hide';
    }

    return (
      <div className={className}>
        <div>
          {props.label}
        </div>
        <div>
          {
            props.icon_type && <i className={'glyphicon icon-' + props.icon_type}></i>
          }
          {this.state.value}
        </div>
      </div>
    );
  }
}

module.exports = IconLabel;
