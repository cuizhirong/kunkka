require('./style/index.less');

var React = require('react');
var Settings = require('./settings');

class NavBar extends React.Component {
  constructor(props) {
    super(props);
  }

  shouldComponentUpdate() {
    return false;
  }

  render() {
    var HALO = this.props.HALO;

    return (
      <div className="halo-com-navbar">
        <div className="logo"></div>
        <div className="user-info">
          <i className="glyphicon icon-avatar"></i>
          <span className="user-name">{HALO.user.username}</span>
          <div ref="settingBtn" className="settings-btn"></div>
          <div className="settings">
            <Settings __={this.props.__} />
          </div>
        </div>
      </div>
    );
  }
}

module.exports = NavBar;
