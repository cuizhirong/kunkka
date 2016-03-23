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
    return (
      <div className="halo-com-navbar">
        <div className="logo"></div>
        <div className="region-wp">
          <i className="glyphicon icon-region"></i>
          <span>Region One</span>
          <div className="region">
            <ul className="region-dropdown">
              <li><a>设置</a></li>
              <li><a>帮助</a></li>
            </ul>
          </div>
        </div>
        <div className="user-info">
          <i className="glyphicon icon-avatar"></i>
          <span className="user-name">{this.props.username}</span>
          <div ref="settingBtn" className="settings-btn"></div>
          <div className="settings">
            <Settings />
          </div>
        </div>
      </div>
    );
  }
}

module.exports = NavBar;
