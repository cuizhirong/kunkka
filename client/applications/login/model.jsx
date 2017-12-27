const React = require('react');
const request = require('./request.js');

class Model extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      username: '',
      errorTip: '',
      notActivate: false,
      loginError: false,
      usernameEmptyError: false,
      passwordEmptyError: false,
      captchaEmptyError: false,
      isSubmitting: false,
      domains: (props.HALO.settings.domains.indexOf('Default') > -1 ? 'Default' : props.HALO.settings.domains[0])
    };

    ['onSubmit', 'onChange', 'onClick'].forEach(item => {
      this[item] = this[item].bind(this);
    });
  }

  onSubmit(e) {
    e.preventDefault();
    let refs = this.refs,
      that = this,
      state = that.state,
      __ = this.props.__,
      captcha = HALO.settings.enable_login_captcha;

    if (state.isSubmitting) {
      return;
    }

    let username = refs.username.value,
      password = refs.password.value,
      data = {
        username: username,
        password: password
      };

    if(captcha || typeof captcha === 'undefined') {
      data.captcha = refs.code.value;
    }

    if(HALO.settings.enable_domain) {
      data.domain = refs.domains.value;
    }

    that.setState({
      loginError: false,
      usernameEmptyError: false,
      passwordEmptyError: false,
      captchaEmptyError: false
    });

    let isEmpty = !username || !password || captcha ? (!refs.code.value) : false;
    if (isEmpty) {
      if (!username) {
        that.setState({
          usernameEmptyError: true
        });
      }
      if (!password) {
        that.setState({
          passwordEmptyError: true
        });
      }
      if(captcha) {
        if(!refs.code.value) {
          that.setState({
            captchaEmptyError: true
          });
        }
      }
      return;
    }
    that.setState({
      isSubmitting: true
    });

    request.login(data).then(function(res) {
      window.location = window.location.pathname;
    }, function(err) {
      let code = JSON.parse(err.responseText).error.code;
      if(code === 400) {
        that.setState({
          errorTip: __.captchaError
        });
      } else if(code === 403) {
        that.setState({
          username: username
        });
      } else {
        that.setState({
          errorTip: __.error_tip
        });
      }
      that.setState({
        loginError: true,
        notActivate: code === 403 ? true : false,
        isSubmitting: false
      });
      // 验证码刷新
      that.refs.captcha.src = '/api/captcha?' + Math.random();
    });
  }

  onChange(type, value, e) {
    let refs = this.refs;

    switch(type) {
      case 'domains':
        this.setState({
          domains: refs.domains.value
        });
        break;
      default:
        break;
    }
  }

  toggleVisibility() {
    this.setState({
      visible: !this.state.visible
    });
  }

  onClick(e) {
    e.preventDefault();
    this.refs.captcha.src = '/api/captcha?' + Math.random();
  }

  render() {
    let props = this.props,
      state = this.state,
      HALO = props.HALO,
      __ = props.__;

    return (
      <div id="container">
        <form method="POST" onSubmit={this.onSubmit}>
          <input type="text" ref="username" name="username" className={state.usernameEmptyError ? 'error' : ''} placeholder={__.account_placeholder} autoFocus="autofocus" autoComplete="off" />
          <i className={'glyphicon icon-eye password' + (state.visible ? ' selected' : '')} onClick={this.toggleVisibility.bind(this)}/>
          <input type={state.visible ? 'text' : 'password'} ref="password" name="password" className={state.passwordEmptyError ? 'error' : ''} placeholder={__.password_placeholder} autoComplete="off" />
          {

            HALO.settings.enable_domain ? <select ref="domains" defaultValue={HALO.settings.default_domain} onChange={this.onChange.bind(this, 'domains', '')}>
              {
                HALO.settings.domains.map((domain) => {
                  return <option key={domain} value={domain}>{domain}</option>;
                })
              }
            </select> : null
          }
          {
            HALO.settings.enable_register ? <div className="find-Password">
                <a href="/auth/password"> {__.forgotPass}</a>
              </div> : null
          }
          {
            HALO.settings.enable_login_captcha || typeof HALO.settings.enable_login_captcha === 'undefined' ? <div className="code-wrapper">
              <input type="text" ref="code" name="code" className={state.captchaEmptyError ? 'error' : ''} placeholder={__.code_placeholder} />
              <div className="img-wrapper">
                <img ref="captcha" onClick={this.onClick} title={__.changeCode} src="/api/captcha" />
              </div>
            </div> : null
          }
          <div className="tip-wrapper">
            <div className={'input-error' + (state.loginError ? '' : ' hide')}>
            {
              !state.notActivate ? <div><i className="glyphicon icon-status-warning"></i><span>{state.errorTip}</span>
               </div> : <div><i className="glyphicon icon-status-warning"></i><span>{__.notActivate_tip}<a href={'/auth/register/success?name=' + state.username}>{__.activate}</a></span></div>
            }
            </div>
          </div>
          <input type="submit" className={state.isSubmitting ? 'disabled' : ''} value={__.login} />
        </form>
        {
          HALO.settings.enable_register ? <div className="link">
            {__.hasAccount}
            <span>|</span>
            {__.isNoAccount}<a href="/register">{__.signup}</a>
          </div>
          : <div className="link"></div>
        }
      </div>
    );
  }
}

module.exports = Model;
