let React = require('react');
let request = require('./request.js');
let Input = require('./components/input/index.jsx');
let Phone = require('./components/phone/index.jsx');
let notification = require('client/uskin/index').Notification;
let getErrorMessage = require('./utils/error_message.js');

class Model extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isLogin: props.HALO.settings.enable_register ? !(props.path === '/signup') : true,
      loginError: false,
      usernameEmptyError: false,
      passwordEmptyError: false,
      isSubmitting: false,
      hasRead: false,
      email_tip: props.__.email_tip,
      account_tip: props.__.account_tip,
      timer: null,
      settings: props.HALO.settings
    };

    ['onSubmit', 'onClick', 'onChange'].forEach(item => {
      this[item] = this[item].bind(this);
    });
  }

  componentDidMount() {
    let wrapper = document.getElementById('container').parentNode;
    let content = wrapper.parentNode;
    content.style.height = !this.state.isLogin ? '530px' : '390px';
    wrapper.style.marginTop = !this.state.isLogin ? '32px' : '58px';
  }

  errorReport(err) {
    notification.addNotice({
      showIcon: true,
      content: err || '',
      isAutoHide: true,
      type: 'danger',
      width: 300,
      id: Date.now()
    });
  }

  onClick(e) {
    let wrapper = document.getElementById('container').parentNode;
    let content = wrapper.parentNode;
    content.style.height = this.state.isLogin ? '530px' : '390px';
    wrapper.style.marginTop = this.state.isLogin ? '32px' : '58px';
    this.setState({
      isLogin: !this.state.isLogin
    }, () => {
      if(!this.state.isLogin) {
        window.history.pushState({}, null, '/signup');
      } else {
        window.history.pushState({}, null, '/');
      }
    });
  }

  onSubmit(e) {
    e.preventDefault();
    let refs = this.refs,
      that = this;

    if (this.state.isSubmitting) {
      return;
    }

    if(this.state.isLogin) {
      let username = refs.username.value,
        password = refs.password.value,
        data = {
          username: username,
          password: password
        };

      that.setState({
        loginError: false,
        usernameEmptyError: false,
        passwordEmptyError: false
      });

      let isEmpty = !username || !password;
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
        return;
      }

      that.setState({
        isSubmitting: true
      });

      request.login(data).then(function(res) {
        window.location = window.location.pathname;
      }, function(err) {
        that.setState({
          loginError: true,
          isSubmitting: false
        });
      });
    } else {
      if(!this.state.canSubmit) {
        return;
      }
      let data = {
        name: refs.name.state.value,
        email: refs.email.state.value,
        phone: refs.phone.state.value,
        code: refs.code.state.value,
        password: refs.password.state.value
      };
      that.setState({
        isSubmitting: true
      });
      request.registerAccount(data).then((res) => {
        window.location = '/auth/register/success?email=' + data.email;
      }).catch((err) => {
        let errorMsg = getErrorMessage(err, true);
        that.setState({
          isSubmitting: false
        });
        if(errorMsg.type === 'SystemError') {
          this.errorReport(errorMsg.message);
        } else {
          errorMsg.location.forEach((item) => {
            refs[item].setState({
              error: true,
              loading: false,
              pass: false,
              showTip: true,
              tipContent: errorMsg.message
            });
          });
        }
      });

    }

  }

  onChange(type, value, e) {
    let refs = this.refs,
      __ = this.props.__,
      that = this,
      canSubmit = false,
      canSub = function() {
        canSubmit = refs.email.state.pass && refs.name.state.pass
          && refs.password.state.pass && refs.confirm_password.state.pass
          && refs.phone.state.pass && (that.state.settings.eula_content ? that.state.hasRead : true);
        that.setState({
          canSubmit: canSubmit
        });
      },
      error = function(message) {
        refs[type].setState({
          error: true,
          loading: false,
          pass: false,
          showTip: true,
          tipContent: message ? message : __[type + '_tip']
        }, canSub);
      },
      loading = function() {
        refs[type].setState({
          error: false,
          loading: true,
          pass: false,
          showTip: false
        }, canSub);
      },
      pass = function() {
        refs[type].setState({
          error: false,
          pass: true,
          loading: false
        }, canSub);
      };

    switch(type) {
      case 'email':
        let regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+\.([a-zA-Z0-9])+/;
        if(!regEmail.test(value)) {
          if(this.state.timer) {
            clearTimeout(this.state.timer);
          }
          error();
        } else {
          loading();
          if(this.state.timer) {
            clearTimeout(this.state.timer);
          }
          this.state.timer = setTimeout(() => {
            request.verifyEmail(value).then((res) => {
              pass();
            }).catch((err) => {
              error(getErrorMessage(err));
            });
          }, 500);
        }
        break;
      case 'name':
        if(value.length > 20 || value.length < 1) {
          if(this.state.timer) {
            clearTimeout(this.state.timer);
          }
          error();
        } else {
          loading();
          if(this.state.timer) {
            clearTimeout(this.state.timer);
          }
          this.state.timer = setTimeout(() => {
            request.verifyUsername(value).then((res) => {
              pass();
            }).catch((err) => {
              error(getErrorMessage(err));
            });
          }, 500);
        }
        break;
      case 'password':
        let checkPsw = function(password) {
          return (password.length < 8 || password.length > 20 || !/^[a-zA-Z0-9]/.test(password) || !/[a-z]+/.test(password) || !/[A-Z]+/.test(password) || !/[0-9]+/.test(password));
        };
        if(checkPsw(value)) {
          refs.password.setState({
            error: true,
            pass: false
          }, canSub);
        } else {
          refs.password.setState({
            error: false,
            pass: true
          }, canSub);
        }
        if(refs.confirm_password.state.value !== '') {
          if(value !== refs.confirm_password.state.value) {
            refs.confirm_password.setState({
              error: true,
              pass: false
            }, canSub);
          } else {
            refs.confirm_password.setState({
              error: false,
              pass: true
            }, canSub);
          }
        }
        break;
      case 'confirm_password':
        if(value !== refs.password.state.value) {
          refs.confirm_password.setState({
            error: true,
            pass: false
          }, canSub);
        } else {
          refs.confirm_password.setState({
            error: false,
            pass: true
          }, canSub);
        }
        break;
      case 'phone':
        let regPhone = /^1[3,4,5,6,7,8]\d{9}$/;
        if(!regPhone.test(value)) {
          refs.phone.setState({
            error: true,
            pass: false
          }, canSub);
        } else {
          refs.phone.setState({
            error: false,
            pass: true,
            tipContent: null
          }, canSub);
        }
        break;
      case 'code':
        refs.code.setState({
          error: false,
          showTip: false,
          tipContent: null
        });
        break;
      case 'readme':
        this.setState({
          hasRead: !this.state.hasRead
        }, canSub);
        break;
      default:
        break;
    }
  }

  render() {
    let props = this.props,
      state = this.state,
      __ = props.__;

    if(state.isLogin) {
      return (
        <div id="container">
          <form method="POST" onSubmit={this.onSubmit}>
            <input type="text" ref="username" name="username" className={state.usernameEmptyError ? 'error' : ''} placeholder={__.account_placeholder} autoFocus="autofocus" autoComplete="off" />
            <input type="password" ref="password" name="password" className={state.passwordEmptyError ? 'error' : ''} placeholder={__.password_placeholder} autoComplete="off" />
            <div className="find-Password">
              <a href="/auth/password"> {__.forgotPass}</a>
            </div>
            <div className="tip-wrapper">
              <div className={'input-error' + (state.loginError ? '' : ' hide')}>
                <i className="glyphicon icon-status-warning"></i><span>{__.error_tip}</span>
              </div>
            </div>
            <input type="submit" className={state.isSubmitting ? 'disabled' : ''} value={__.submit} />
          </form>
          {
            state.settings.enable_register ? <div className="link">
              {__.hasAccount}
              <span>|</span>
              {__.isNoAccount}<a onClick={this.onClick}>{__.signup}</a>
            </div>
            : null
          }
        </div>
      );
    } else {
      return (
        <div id="container">
          <form method="POST" onSubmit={this.onSubmit}>
            <Input input_type="text" ref="email" name="email" __={__} tip={true} placeholder={__.email_placeholder} onChange={this.onChange} />
            <Input input_type="text" ref="name" name="name" __={__} tip={true} placeholder={__.name_placeholder} onChange={this.onChange} />
            <Input input_type="password" ref="password" name="password" __={__} tip={true} placeholder={__.password_placeholder} onChange={this.onChange} />
            <Input input_type="password" ref="confirm_password" name="confirm_password" onChange={this.onChange} placeholder={__.confirm_password_placeholder} />
            <Phone ref="phone" name="phone" __={__} onChange={this.onChange} />
            <Input input_type="text" ref="code" name="code" __={__} tip={true} placeholder={__.code_placeholder} onChange={this.onChange} />
            <div key="checkbox" className="checkbox">
              {
                state.settings.eula_content ? <div>
                  <input name="readme" value="null" type="checkbox" checked={this.state.hasRead} onChange={this.onChange.bind(this, 'readme', '')}/>
                  <span>{__.readAgree}<a href={state.settings.eula_content}>{__.eula}</a></span>
                </div>
                : null
              }
            </div>
            <input type="submit" className={(state.isSubmitting || !state.canSubmit) ? 'disabled' : ''} value={__.signup} />
          </form>
          <div className="link">
            {__.noAccount}
            <span>|</span>
            {__.isHasAccount}<a onClick={this.onClick}>{__.submit}</a>
          </div>
        </div>
      );
    }
  }
}

module.exports = Model;
