const React = require('react');
const ShortTip = require('../short_tip/index');

const copyObj = function(obj) {
  let newobj = obj.constructor === Array ? [] : {};
  if (typeof obj !== 'object') {
    return newobj;
  } else {
    newobj = JSON.parse(JSON.stringify(obj));
  }
  return newobj;
};

class GroupSelect extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.value ? props.value : '',
      disabled: !!props.disabled,
      hide: !!props.hide,
      data: props.data ? copyObj(props.data) : [],
      checkedField: props.checkedField ? props.checkedField : false,
      clicked: false,
      error: props.error ? props.error : false
    };

    this.onChange = this.onChange.bind(this);
    this.renderData = this.renderData.bind(this);
  }

  onChange(e) {
    if (e.target.value === 'on') {
      this.setState({
        checkedField: this.props.field
      });
    } else {
      this.setState({
        checkedField: this.props.field,
        value: e.target.value
      });
    }
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

  renderData() {
    let props = this.props,
      state = this.state,
      __ = props.__;

    return (
      <div className="radio-input">
        <input
          className={state.error ? 'error' : ''}
          type={props.input_type}
          disabled={state.disabled || (state.checkedField && state.checkedField !== props.field)}
          onChange={this.onChange}
          value={state.value} />
        {
          props.tip_info && <ShortTip label={__[props.tip_info]} />
        }
      </div>);
  }

  render() {
    let props = this.props,
      state = this.state;
    let className = 'modal-row radio-input-row';
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
          {props.checkedField && <input type="radio" checked={state.checkedField === props.field} onChange={this.onChange} />}
          {this.renderData()}
        </div>
      </div>
    );
  }
}

module.exports = GroupSelect;
