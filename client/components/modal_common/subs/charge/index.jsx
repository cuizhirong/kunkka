var React = require('react');

class Charge extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: props.value ? props.value : 0.000,
      hide: props.hide
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.value === nextState.value && this.state.hide === nextState.hide) {
      return false;
    }
    return true;
  }

  componentDidUpdate() {
    this.props.onAction(this.props.field, this.state);
  }

  render() {
    var props = this.props;
    var state = this.state;

    var __ = this.props.__;
    var value = state.value;

    return (
      <div className={'modal-row charge-row' + (state.hide ? ' hide' : '')}>
        {
          props.has_label || props.has_long_label ?
            <div className={props.has_label ? 'label-row' : 'long-label-row'} />
          : null
        }
        <div className="account-box">
          <div className="account-md">
            <strong>{__.account.replace('{0}', value)}</strong> / <span>{__.hour}</span>
          </div>
          <div className="account-md account-gray">
            {'( ' + __.account.replace('{0}', value) + ' / ' + __.month + ' )'}
          </div>
        </div>
      </div>
    );
  }
}

module.exports = Charge;
