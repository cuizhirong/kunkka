var React = require('react');

class Settings extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      initialized: false
    };
  }

  onClick(key, e) {
    switch (key) {
      case 'setting':
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

  updateSetting() {
    this.setState({
      initialized: true
    });
  }

  componentDidMount() {
    this.updateSetting();
  }

  setTmpl() {
    var currtLang = HALO.configs.lang;
    var __ = this.props.__;

    // {
    //   title: __.setting,
    //   key: 'settings',
    //   icon: 'setting'
    // }
    var config = [{
      key: 'lang',
      icon: 'global'
    }, {
      title: __.logout,
      key: 'logout',
      icon: 'logout'
    }];

    return config.map((item, index) => {
      if (item.key === 'lang') {
        return (
          <li className="lang" key={index}>
            <i className={'glyphicon icon-' + item.icon} />
            <a className={currtLang === 'en' ? 'disabled' : 'active'}
              onClick={currtLang === 'en' ? null : this.onClick.bind(null, 'en')}>English</a>
            <span>|</span>
            <a className={currtLang === 'zh-CN' ? 'disabled' : 'active'}
              onClick={currtLang === 'zh-CN' ? null : this.onClick.bind(null, 'cn')}>中文</a>
          </li>
        );
      } else {
        return (
          <li key={index} onClick={this.onClick.bind(null, item.key)}>
            <i className={'glyphicon icon-' + item.icon} />
            <a>{item.title}</a>
          </li>
        );
      }

    });
  }

  render() {
    return (
      <ul className="settings-dropdown">
        {this.state.initialized ? this.setTmpl() : null}
      </ul>
    );
  }
}

module.exports = Settings;
