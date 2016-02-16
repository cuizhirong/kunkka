require('./style/index.less');

var React = require('react');

class VncConsole extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    var data = this.props.data;

    return (
      <div className="halo-com-console-output" data-id={this.props['data-id']}>
        <div className="output">
          {data.map((item, i) =>
            <p key={i}>{item}</p>
          )}
        </div>
      </div>
    );
  }

}

module.exports = VncConsole;
