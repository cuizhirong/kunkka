var React = require('react');

class ShortTip extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hide: !!props.hide,
      label: props.label
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      label: nextProps.label
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    for (var index in this.state) {
      if (this.state[index] !== nextState[index]) {
        return true;
      }
    }

    return false;
  }

  componentDidUpdate() {
    this.props.onAction && this.props.onAction(this.props.field, this.state);
  }

  render() {
    var props = this.props,
      state = this.state;
    var className = 'modal-row short-tip-row';
    if (props.has_label) {
      className += ' label-row';
    } else if (props.has_long_label) {
      className += ' long-label-row';
    }
    if (this.state.hide) {
      className += ' hide';
    }

    return <div className={className} dangerouslySetInnerHTML={{__html: state.label}}></div>;
  }
}

module.exports = ShortTip;
