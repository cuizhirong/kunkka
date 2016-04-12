require('./style/index.less');

var React = require('react');

class Model extends React.Component {

  constructor(props) {
    super(props);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.style.display === 'none' && this.props.style.display === 'none') {
      return false;
    }
    return true;
  }


  render() {
    return (
      <div className="halo-module-snapshot" style={this.props.style}>
        <div className="test">This is Snapshot.</div>
      </div>
    );
  }
}

module.exports = Model;
