require('./style/index.less');

var React = require('react');

class VncConsole extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="halo-com-vnc-console">
        <iframe src={this.props.src} data-id={this.props['data-id']} />
      </div>
    );
  }

}

module.exports = VncConsole;
