var React = require('react');
var __ = require('i18n/client/lang.json');

class Text extends React.Component {
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
    var className = this.state.hide ? 'modal-row text-row hide' : 'modal-row text-row';

    return <div className={className}>{__[this.props.info] || this.props.info}</div>;
  }
}

module.exports = Text;
