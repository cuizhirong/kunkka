var React = require('react');

class PopLink extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      disabled: false
    };

    this.onClick = this.onClick.bind(this);
  }

  onClick(e) {
    var props = this.props;
    props.onAction(props.field, this.state);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return false;
  }

  componentDidUpdate() {
   // this.props.onAction(this.props.field, this.state);
  }

  render() {
    return (
      <div className="row">
        <a style={{color: '#aaff00'}} onClick={this.onClick}>弹出弹窗</a>
      </div>
    );
  }
}

module.exports = PopLink;
