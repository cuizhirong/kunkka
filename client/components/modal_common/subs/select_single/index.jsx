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

class SelectSingle extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: props.value,
      disabled: props.disabled,
      hide: props.hide,
      data: copyObj(props.data)
    };

    this.onChange = this.onChange.bind(this);
    this.time = (new Date()).getTime();
  }

  onChange(value) {
    if(Object.prototype.toString.call(value) === '[object Object]') {
      if(value.disabled) {
        return;
      }
      this.setState({
        value: value
      });
    } else {
      this.setState({
        value: value
      });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    let now = (new Date()).getTime();
    if (nextState.value === null && (now - this.time < 50)) {
      return false;
    } else {
      return true;
    }
  }

  componentDidUpdate() {
    this.time = (new Date()).getTime();
    this.props.onAction(this.props.field, this.state);
  }

  render() {
    let props = this.props,
      state = this.state;
    let className = 'modal-row select-single-row';
    if (props.is_long_label) {
      className += ' label-row long-label-row';
    } else {
      className += ' label-row';
    }
    if (state.hide) {
      className += ' hide';
    }

    let that = this;
    function renderTabs() {
      let data = state.data, columnNum = props.columnNum, ret = [];
      let width = (100 - (columnNum - 1) * 2) / columnNum + '%';

      for(let i = 0; i < data.length; i += columnNum) {
        let tabs = [];
        for(let j = i; j < i + columnNum; j++) {
          if (j < data.length) {
            let value = data[j];
            if(Object.prototype.toString.call(data[j]) === '[object Object]') {
              let cn = value.name === state.value.name ? 'selected' : '';
              if(value.disabled) {
                cn += ' disabled';
              }
              tabs.push(
                <a key={value.id}
                  style={{width: width}}
                  className={cn}
                  onClick={value.name === state.value.name ? null : that.onChange.bind(that, value)}>
                  {props.__[value.name] || value.name}
                </a>
              );
            } else {
              tabs.push(
                <a key={value}
                  style={{width: width}}
                  className={value === state.value ? 'selected' : ''}
                  onClick={value === state.value ? null : that.onChange.bind(that, value)}>
                  {props.__[value] || value}
                </a>
              );
            }
          }
        }
        ret.push(<div key={i}>{tabs}</div>);
      }

      return ret;
    }

    return (
      <div className={className}>
        <div>
          {
            props.required && <strong>*</strong>
          }
          {props.label}
        </div>
        <div>{renderTabs()}</div>
      </div>
    );
  }
}

SelectSingle.defaultProps = {
  value: '',
  disabled: false,
  hide: false,
  data: []
};

module.exports = SelectSingle;
