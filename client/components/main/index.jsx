require('./style/index.less');

var React = require('react');

class Main extends React.Component {
  constructor(props) {
    super(props);

  }

  componentWillMount() {}

  componentDidMount() {

  }

  componentWillReceiveProps() {

  }

  render() {
    return (
      <div className="halo-com-main">
        {this.props.children}
      </div>
    );
  }
}

module.exports = Main;
