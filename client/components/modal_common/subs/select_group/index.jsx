var React = require('react');
var __ = require('i18n/client/lang.json');

var copyObj = (obj) => {
  var newobj = obj.constructor === Array ? [] : {};
  if (typeof obj !== 'object') {
    return newobj;
  } else {
    newobj = JSON.parse(JSON.stringify(obj));
  }
  return newobj;
};

class SelectGroup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      disabled: !!props.disabled,
      hide: !!props.hide,
      data: props.data ? copyObj(props.data) : []
    };

    this.onChange = this.onChange.bind(this);
    this.renderEmpty = this.renderEmpty.bind(this);
  }

  onChange(index) {
    var data = copyObj(this.state.data);
    data[index].selected = !data[index].selected;
    this.setState({
      data: data
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
                props.empty_text.link_info.map((m) => {
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
    var className = 'modal-row select-group-row';
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
            state.data.map((item, index) => {
              return <a key={item.id} className={item.selected ? 'selected' : ''} href="#" onClick={this.onChange.bind(this, index)} value={item}>{item.name}</a>;
            })
          }
          {this.renderEmpty()}
        </div>
      </div>
    );
  }
}

module.exports = SelectGroup;
