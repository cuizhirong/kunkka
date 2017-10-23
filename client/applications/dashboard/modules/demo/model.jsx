require('./style/index.less');

const React = require('react');

class Model extends React.Component {

  constructor(props) {
    super(props);
  }

  componentWillMount() {

  }

  componentDidMount() {

  }

  render() {
    return (
      <div className="halo-module-demo" style={this.props.style}>
        <div ref="c" id="c"></div>
      </div>
    );
  }

}

module.exports = Model;
