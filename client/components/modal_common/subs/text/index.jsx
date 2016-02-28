var React = require('react');

class Text extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return <div className="row">{this.props.label}</div>;
  }
}

module.exports = Text;
