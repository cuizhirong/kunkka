var React = require('react');
var __ = require('i18n/client/lang.json');

class Tab extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.value ? props.value : '',
      disabled: !!props.disabled,
      hide: !!props.hide
    };

    this.onChange = this.onChange.bind(this);
  }

  onChange(value) {
    this.setState({
      value: value
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
    this.props.onAction(this.props.field, this.state);
  }

  render() {
    var props = this.props,
      state = this.state;
    var className = 'modal-row tab-row';
    if (props.is_long_label) {
      className += ' label-row long-label-row';
    } else {
      className += ' label-row';
    }
    if (state.hide) {
      className += ' hide';
    }

    return (
      <div className={className}>
        <div>
          {
            props.required && <strong>*</strong>
          }
          {props.label + ':'}
        </div>
        <div>
          {
            props.data.map((value, index) => {
              return <a key={value} className={value === state.value ? 'selected' : ''} href="#" onClick={this.onChange.bind(this, value)}>{__[value]}</a>;
            })
          }
        </div>
      </div>
    );
  }
}

module.exports = Tab;
