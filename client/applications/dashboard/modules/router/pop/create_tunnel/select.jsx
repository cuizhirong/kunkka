require('./style/index.less');

const React = require('react');
const __ = require('locale/client/dashboard.lang.json');

const copyObj = function(obj) {
  let newobj = obj.constructor === Array ? [] : {};
  if (typeof obj !== 'object') {
    return newobj;
  } else {
    newobj = JSON.parse(JSON.stringify(obj));
  }
  return newobj;
};

class SelectData extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: props.value ? props.value : '',
      data: props.data ? copyObj(props.data) : [],
      clicked: false
    };

    this.renderData = this.renderData.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onLinkClick = this.onLinkClick.bind(this);
  }

  onLinkClick() {
    this.setState({
      clicked: true
    });
  }

  onChange(e) {
    this.setState({
      value: e.target.value
    });
  }

  componentDidUpdate() {
    this.props.onAction && this.props.onAction(this.props.field, this.state, this.refs);
  }

  renderData() {
    let props = this.props,
      state = this.state;
    if (state.data && state.data.length > 0) {
      return (
        <select value={state.value} onChange={this.onChange}>
          {
            state.data.map(function(v) {
              return <option key={v.id} value={v.id}>{v.name || '(' + v.id.substr(0, 8) + ')'}</option>;
            })
          }
        </select>
      );
    } else {
      let content = __.no_resources.replace('{0}', __[props.field]);
      return (
        <span className="empty-text-label">{content}</span>
      );
    }
  }

  render() {
    let props = this.props;
    return (
      <div className="halo-pop-com-select">
        <div>
          {__[props.field]}
        </div>
        <div>
          {this.renderData()}
          <a onClick={this.onLinkClick}>{__.create}</a>
        </div>
      </div>
    );
  }

}

function popSelect(config) {
  return <SelectData ref="select" {...config} />;
}

module.exports = popSelect;
