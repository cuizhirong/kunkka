require('./style/index.less');

var React = require('react');
var Dropdown = require('client/uskin/index').Dropdown;

class NavBar extends React.Component {
  constructor(props) {
    super(props);
  }

  dropdownOnClick(e, status) {
    //dropdown clicked
  }

  render() {
    var dropdownItems = [{
      items: [{
        title: 'Settings',
        key: 'setting',
        onClick: this.dropdownOnClick
      }, {
        title: 'Help',
        key: 'help',
        onClick: this.dropdownOnClick
      }, {
        title: 'English',
        key: 'en',
        onClick: () => {
          window.location = '/?lang=en';
        }
      }, {
        title: '中文',
        key: 'cn',
        onClick: () => {
          window.location = '/?lang=zh-CN';
        }
      }, {
        title: 'Logout',
        key: 'logout',
        onClick: () => {
          window.location = '/auth/logout';
        }
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
            <Dropdown items={dropdownItems}/>
          </div>
        </div>
      </div>
    );
  }
}

module.exports = NavBar;
