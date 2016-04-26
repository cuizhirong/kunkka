require('./style/index.less');

var React = require('react');
var Topology = require('../../components/topology/index');

class Model extends React.Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    var t = new Topology(this.refs.c, {});
    t.render();
  }

  render() {
    return (
      <div className="halo-module-topology" style={this.props.style}>
        <div ref="c" id="c">
        </div>
      </div>
    );
  }

}

module.exports = Model;
