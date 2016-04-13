require('./style/index.less');

var React = require('react');

class Model extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="halo-module-overview-host" style={this.props.style}>
        <div className="test">Overview(host) is under construction.</div>
      </div>
    );
  }

}

module.exports = Model;
