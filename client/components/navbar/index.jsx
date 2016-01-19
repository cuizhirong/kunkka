require('./style/index.less');

var React = require('react');
var Dropdown = require('client/uskin/index').Dropdown;

class NavBar extends React.Component {
  constructor(props) {
    super(props);
  }

  clickSettings(e, status) {
    switch (status.key) {
      case 'setting':
        break;
      case 'help':
        break;
      case 'en':
        window.location = '/?lang=en';
        break;
      case 'cn':
        window.location = '/?lang=zh-CN';
        break;
      case 'logout':
        window.location = '/auth/logout';
        break;
      default:
        break;
    }
  }

  render() {
    var dropdownItems = [{
      items: [{
        title: 'Settings',
        key: 'setting'
      }, {
        title: 'Help',
        key: 'help'
      }, {
        title: 'English',
        key: 'en'
      }, {
        title: '中文',
        key: 'cn'
      }, {
        title: 'Logout',
        key: 'logout'
      }]
    }];

    return (
      <div className="halo-navbar">
        <div className="logo"></div>
        <div className="user-info">
          <i className="glyphicon icon-role"></i>
          <span className="user-name">user name</span>
          <div ref="settingBtn" className="settings-btn"></div>
          <div className="settings">
            <Dropdown items={dropdownItems} onClick={this.clickSettings}/>
          </div>
        </div>
      </div>
    );
  }
}

module.exports = NavBar;
