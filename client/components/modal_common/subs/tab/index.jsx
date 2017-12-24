const React = require('react');

const copyObj = function(obj) {
  let newobj = obj.constructor === Array ? [] : {};
  if (typeof obj !== 'object') {
    return newobj;
  } else {
    newobj = JSON.parse(JSON.stringify(obj));
  }
  return newobj;
};

class Tab extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: props.value ? props.value : '',
      disabled: !!props.disabled,
      hide: !!props.hide,
      data: props.data ? copyObj(props.data) : []
    };

    this.onChange = this.onChange.bind(this);
  }

  onChange(value) {
    this.setState({
      value: value
    }, () => {
      this.props.onAction(this.props.field, this.state);
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    for (let index in this.state) {
      if (typeof this.state[index] !== 'object') {
        if (this.state[index] !== nextState[index]) {
          return true;
        }
      } else {
        if (JSON.stringify(this.state[index]) !== JSON.stringify(nextState[index])) {
          return true;
        }
      }
    }
    return false;
  }

  componentDidUpdate() {
    this.props.onAction(this.props.field, this.state);
  }

  render() {
    let props = this.props,
      state = this.state,
      __ = props.__;
    let className = 'modal-row tab-row';
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
          {props.label}
        </div>
        <div>
          {
            state.data.length > 0 ? state.data.map((value, index) => {
              return <a key={value} title={value} className={value === state.value ? 'selected' : ''} onClick={this.onChange.bind(this, value)}>{props.__[value] || value}</a>;
            }) : <span>{__[props.empty_text]}</span>
          }
        </div>
      </div>
    );
  }
}

module.exports = Tab;
