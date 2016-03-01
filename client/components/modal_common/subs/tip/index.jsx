var React = require('react');
var Tip = require('client/uskin/index').Tip;
var __ = require('i18n/client/lang.json');

class Error extends React.Component {
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
    var props = this.props;

    var className = this.state.hide ? 'modal-row tip-row hide' : 'modal-row tip-row';
    var type = (props.type === 'error') ? 'danger' : props.type;

    return (
      <div className={className}>
        <Tip type={type} title={__[props.title]} content={props.label} showIcon={true} width={466} />
      </div>
    );
  }
}

module.exports = Error;
