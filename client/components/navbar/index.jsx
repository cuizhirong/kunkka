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
