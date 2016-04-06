require('./style/index.less');

var React = require('react');

class Model extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="halo-module-overview" style={this.props.style}>
        <div className="test">Overview is under construction.</div>
      </div>
    );
  }

}

module.exports = Model;
