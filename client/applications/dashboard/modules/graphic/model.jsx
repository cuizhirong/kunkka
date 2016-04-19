require('./style/index.less');

var Chart = require('client/libs/charts/index');

var React = require('react');

class Model extends React.Component {

  constructor(props) {
    super(props);
  }

  componentWillMount() {

  }

  componentDidMount() {
    var c = this.refs.c;
    var chart = new Chart(c, {width: 300, height: 300});
    chart.draw();
  }

  render() {
    return (
      <div className="halo-module-graphic" style={this.props.style}>
        <div ref="c" id="c"></div>
      </div>
    );
  }

}

module.exports = Model;
