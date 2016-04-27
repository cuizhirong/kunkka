require('./style/index.less');

var React = require('react');
var Topology = require('../../components/topology/index');

var request = require('./request');

class Model extends React.Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    request.getList().then(data => {
      var t = new Topology(this.refs.c, data);
      t.render();
    });
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
