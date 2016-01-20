var React = require('react');

class Settings extends React.Component {
  constructor(props) {
    super(props);
  }

  settingsOnClick(type, e) {
    switch (type.key) {
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
    var currtLang = 'zh-CN'; //simulate get currentLang

    var config = [{
      title: 'Settings',
      key: 'settings',
      icon: 'setting'
    }, {
      title: 'Help',
      key: 'help',
      icon: 'help'
    }, {
      title: '',
      key: 'lang',
      icon: 'gobal',
      render: function(that, item) {
        return (
          <li className="lang">
            <i className={'glyphicon icon-' + item.icon} />
            <a className={currtLang === 'en' ? 'disabled' : 'active'}
              onClick={currtLang === 'en' ? null : that.settingsOnClick.bind(null, 'en')}>English</a>
            <span>&nbsp;|&nbsp;</span>
            <a className={currtLang === 'zh-CN' ? 'disabled' : 'active'}
              onClick={currtLang === 'zh-CN' ? null : that.settingsOnClick.bind(null, 'cn')}>中文</a>
          </li>
        );
      }
    }, {
      title: 'Logout',
      key: 'logout',
      icon: 'logout'
    }];

    return (
      <ul className="settings-dropdown">
        {config.map((item, index) => {
          return (
            item.render ? item.render(this, item)
              : <li key={index} onClick={this.settingsOnClick.bind(null, item)}>
                  <i className={'glyphicon icon-' + item.icon} />
                  <a>{item.title}</a>
                </li>
          );
        })}
      </ul>
    );
  }
}

module.exports = Settings;
