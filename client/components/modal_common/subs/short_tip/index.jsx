var React = require('react');

class ShortTip extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hide: !!props.hide
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.hide === nextState.hide) {
      return false;
    }
    return true;
  }

  componentDidUpdate() {
    this.props.onAction(this.props.field, this.state);
  }

  render() {
    var className = this.state.hide ? 'modal-row short-tip-row hide' : 'modal-row short-tip-row';

    return <div className={className}>{this.props.label}</div>;
  }
}

module.exports = ShortTip;
