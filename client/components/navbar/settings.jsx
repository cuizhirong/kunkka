const React = require('react');
const ReactDOM = require('react-dom');
const Password = require('client/components/password/index');

class Settings extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      initialized: false
    };
  }

  onClick(key, e) {
    switch (key) {
      case 'settings':
        let setWidth = (node, width) => {
          ['maxWidth', 'width', 'minWidth'].forEach((w) => {
            node.style[w] = width;
            node.style.overflowX = 'hidden';
          });
        };
        let haloMenu = document.getElementsByClassName('halo-com-menu')[0];
        setWidth(haloMenu, '180px');
        document.getElementById('main').style.display = 'none';

        let wrapper = document.getElementById('main-wrapper');
        let div = document.createElement('div');
        div.setAttribute('class', 'pwd');
        div.setAttribute('style', ['flex: 1']);
        wrapper.appendChild(div);

        ReactDOM.render(<Password __={this.props.__}/>, document.getElementsByClassName('pwd')[0]);
        break;
      case 'en':
        window.location = '/?lang=en';
        break;
      case 'zh-CN':
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
    let currtLang = HALO.configs.lang;
    let __ = this.props.__;

    let config = [{
      title: __.personal_settings,
      key: 'settings',
      icon: 'setting'
    }, {
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
          <li className="lang" key={index} onClick={this.onClick.bind(null, currtLang === 'en' ? 'zh-CN' : 'en')}>
            <i className={'glyphicon icon-' + item.icon} />
            <span>{currtLang === 'en' ? '中文' : 'English'}</span>
          </li>
        );
      } else {
        return (
          <li key={index} onClick={this.onClick.bind(this, item.key)}>
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
