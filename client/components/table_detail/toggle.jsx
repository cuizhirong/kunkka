require('./style/index.less');

var React = require('react');

class Toggle extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      toggle: false
    };

    this.toggle = this.toggle.bind(this);
  }

  componentWillMount() {
    this.setState({
      toggle: this.props.defaultUnfold
    });
  }

  toggle(e) {
    this.setState({
      toggle: !this.state.toggle
    });
  }

  render() {
    return (
      <div className="toggle">
        <div className="toggle-title" onClick={this.toggle}>
          {this.props.title}
          <i className={'glyphicon icon-arrow-' + (this.state.toggle ? 'down' : 'up')} />
        </div>
        <div className={'toggle-content' + (this.state.toggle ? ' unfold' : ' fold')}>
          {this.props.children}
        </div>
      </div>
    );
  }

}

module.exports = Toggle;
