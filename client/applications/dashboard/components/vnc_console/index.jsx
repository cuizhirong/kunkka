require('./style/index.less');

const React = require('react');

class VncConsole extends React.Component {
  constructor(props) {
    super(props);
  }

  onLoad() {
    this.iframeElem.focus();
  }

  onClickMask() {
    this.iframeElem.focus();
  }

  render() {
    return (
      <div className="halo-com-vnc-console">
        <iframe src={this.props.src} data-id={this.props['data-id']} onLoad={this.onLoad.bind(this)} ref={(elem) => { this.iframeElem = elem; }} />
        {/* a mask for capture user's click event */}
        <div className="iframe-mask" onClick={this.onClickMask.bind(this)}></div>
      </div>
    );
  }

}

module.exports = VncConsole;
