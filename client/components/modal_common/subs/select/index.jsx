var React = require('react');
var __ = require('i18n/client/lang.json');

var copyObj = function(obj) {
  var newobj = obj.constructor === Array ? [] : {};
  if (typeof obj !== 'object') {
    return newobj;
  } else {
    newobj = JSON.parse(JSON.stringify(obj));
  }
  return newobj;
};

class Select extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.value ? props.value : '',
      disabled: !!props.disabled,
      hide: !!props.hide,
      data: props.data ? copyObj(props.data) : []
    };

    this.onChange = this.onChange.bind(this);
    this.renderEmpty = this.renderEmpty.bind(this);
  }

  onChange(e) {
    this.setState({
      value: e.target.value
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    for (var index in this.state) {
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

  renderEmpty() {
    var props = this.props,
      state = this.state;
    if (props.empty_text && (!state.data || state.data.length < 1)) {
      if (props.empty_text.link_info) {
        return (
          <span className={'empty-text-label'}>
            {__[props.empty_text.info]}
            <a href="#" onClick={props.onLinkClick}>
              {
                props.empty_text.link_info.map(function(m) {
                  return __[m];
                }).join('')
              }
            </a>
          </span>
        );
      } else {
        return (
          <span className="empty-text-label">{__[props.empty_text]}</span>
        );
      }
    }
  }

  render() {
    var props = this.props,
      state = this.state;
    var className = 'modal-row select-row';
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
          {props.label + ':'}
        </div>
        <div>
          {
            state.data && state.data.length > 0 && <select ref="select" onChange={this.onChange}>
            {
              state.data.map(function(v) {
                return <option key={v.id} value={v.id}>{v.name}</option>;
              })
            }
            </select>
          }
          {this.renderEmpty()}
        </div>
      </div>
    );
  }
}

module.exports = Select;
