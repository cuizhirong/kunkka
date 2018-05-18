const React = require('react');
const request = require('./request.js');
const AES = require('crypto-js/aes');

class Model extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      username: '',
      errorCounter: 0,
      errorTip: '',
      notActivate: false,
      loginError: false,
      mustChangePwd: false,
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

  processData(data) {
    if (!data) return null;

    let type = Object.prototype.toString.call(data);
    if (type === '[object Object]' || type === '[object Array]') {
      return JSON.stringify(data);
    }
    return null;
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

    if(captcha || typeof captcha === 'undefined' || state.errorCounter >= 2) {
      data.captcha = refs.code.value;
    }

    if(HALO.settings.enable_domain) {
      data.domain = refs.domains.value;
    }

    that.setState({
      loginError: false,
      errorTip: '',
      usernameEmptyError: false,
      passwordEmptyError: false,
      captchaEmptyError: false,
      notActivate: false,
      mustChangePwd: false
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

    let urls = [],
      remotes = HALO.kunkka_remotes,
      enableSafety = HALO.settings.enable_safety;

    //kunkka_remotes中各个remote的url相同的话全部相同，不同的话全部不相同
    if (remotes.length > 1 && remotes[0].url !== remotes[1].url) {
      remotes.forEach(remote => {
        remote.url.indexOf(window.location.hostname) === -1 && urls.push(remote.url);
      });
    }

    if (enableSafety) {
      // 密码加密
      request.getEncryptionKey().then((response) => {
        const cipherObject = AES.encrypt(data.password, response.uuid);
        data.password = cipherObject.toString();

        that.postLogin(data, urls, username, state, that);
      }).catch(() => {
        that.setState({
          errorTip: __.unknown_error,
          loginError: true,
          isSubmitting: false
        });
      });
    } else {
      that.postLogin(data, urls, username, state, that);
    }
  }

  postLogin(data, urls, username, state, that) {
    let xhr = new XMLHttpRequest();
    if (urls.length > 0) {
      urls.forEach(url => {
        try {
          xhr.open('POST', url + '/auth/login', true);
          xhr.withCredentials = true;
          xhr.setRequestHeader('Content-Type', 'application/json');

          xhr.send(this.processData(data));
        } catch(error) {console.log(error);}
      });
    }

    request.login(data).then(function(res) {
      window.location = window.location.pathname;
    }, function(err) {
      let error;
      try {
        error = JSON.parse(err.responseText).error;
      } catch(parseError) {
        error = {};
      }

      let code = error.code;
      let errorType = error.type;
      if(code === 400) {
        if(errorType === 'captchaError') {
          that.setState({
            errorTip: __.captchaError
          });
        } else {
          that.setState({
            errorTip: __.unknown_error
          });
        }
      } else if(code === 403) {
        switch (errorType) {
          case 'unEnabled':
            that.setState({
              username: username,
              notActivate: true
            });
            break;
          case 'manyFailures':
            let timeLeft = Math.ceil(error.remain / 60 / 1000);
            that.setState({
              errorTip: __.many_failures.replace(/\{0\}/, timeLeft)
            });
            break;
          case 'passwordExpired':
            that.setState({
              mustChangePwd: true
            });
            break;
          default:
            that.setState({
              errorTip: __.unknown_error
            });
            break;
        }
      } else {
        that.setState({
          errorCounter: ++state.errorCounter,
          errorTip: __.error_tip
        });
      }

      that.setState({
        loginError: true,
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


  renderErrorTip() {
    const state = this.state;
    const __ = this.props.__;
    if(state.notActivate) {
      return (
        <span>{__.notActivate_tip}<a href={'/auth/register/success?name=' + state.username}>{__.activate}</a></span>
      );
    } else if(state.mustChangePwd) {
      return (
        <span>{__.passwd_expired}<a href={'/auth/password'}>{__.change_passwd}</a></span>
      );
    } else {
      return (
        <span>{state.errorTip}</span>
      );
    }
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
            HALO.settings.enable_login_captcha || typeof HALO.settings.enable_login_captcha === 'undefined' || state.errorCounter >= 2 ? <div className="code-wrapper">
              <input type="text" ref="code" name="code" className={state.captchaEmptyError ? 'error' : ''} placeholder={__.code_placeholder} />
              <div className="img-wrapper">
                <img ref="captcha" onClick={this.onClick} title={__.changeCode} src="/api/captcha" />
              </div>
            </div> : null
          }
          <div className="tip-wrapper">
            <div className={'input-error' + (state.loginError ? '' : ' hide')}>
              <i className="glyphicon icon-status-warning"></i>
              { this.renderErrorTip() }
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
