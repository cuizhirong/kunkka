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
      loginError: false,
      usernameEmptyError: false,
      passwordEmptyError: false,
      isSubmitting: false,
      hasRead: false,
      email_tip: props.__.email_tip,
      account_tip: props.__.account_tip,
      timer: null
    };

    ['onSubmit', 'onChange'].forEach(item => {
      this[item] = this[item].bind(this);
    });
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

  onSubmit(e) {
    e.preventDefault();
    let refs = this.refs,
      that = this,
      state = that.state;

    if (state.isSubmitting) {
      return;
    }

    if(!state.canSubmit) {
      return;
    }
    let data = {
      name: refs.name.state.value,
      full_name: refs.fullName.state.value,
      company: refs.company.state.value,
      email: refs.email.state.value,
      phone: refs.phone.state.value,
      code: refs.phone.state.code,
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

  onChange(type, value, e) {
    let refs = this.refs,
      __ = this.props.__,
      that = this,
      canSubmit = false,
      canSub = function() {
        canSubmit = refs.email.state.pass && refs.name.state.pass
          && refs.fullName.state.pass && refs.company.state.pass
          && refs.password.state.pass && refs.confirm_password.state.pass
          && refs.phone.state.code.length === 6
          && refs.phone.state.pass && (that.props.HALO.settings.eula_content ? that.state.hasRead : true);
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
        let regEmail = /^([a-zA-Z0-9.+_-])+@([a-zA-Z0-9_-])+\.([a-zA-Z0-9])+/;
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
        let nameRegExp = /^[a-zA-Z0-9_+-]{1,20}$/;
        if(!(nameRegExp.test(value))) {
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
      case 'fullName':
        let fullNameRegExp = /^[a-zA-Z0-9_+-]{1,30}$/;
        if (!(fullNameRegExp.test(value))) {
          error();
        } else {
          pass();
        }
        break;
      case 'company':
        if (value.length > 80 || value.length < 1) {
          error();
        } else {
          pass();
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
            pass: false,
            tipContent: null
          }, canSub);
        } else {
          refs.phone.setState({
            error: false,
            pass: true,
            tipContent: null
          }, canSub);
        }
        break;
      case 'readme':
        this.setState({
          hasRead: !this.state.hasRead
        }, canSub);
        break;
      case 'code':
        this.setState({}, canSub);
        break;
      default:
        break;
    }
  }

  render() {
    let props = this.props,
      state = this.state,
      __ = props.__,
      HALO = props.HALO;

    return (
      <div id="container">
        <form method="POST" onSubmit={this.onSubmit}>
          <Input input_type="text" ref="email" name="email" __={__} tip={true} placeholder={__.email_placeholder} onChange={this.onChange} />
          <Input input_type="text" ref="name" name="name" __={__} tip={true} placeholder={__.name_placeholder} onChange={this.onChange} />
          <Input input_type="text" ref="fullName" name="fullName" __={__} tip={true} placeholder={__.fullName_placeholder} onChange={this.onChange} />
          <Input input_type="text" ref="company" name="company" __={__} tip={true} placeholder={__.company_placeholder} onChange={this.onChange} />
          <Input input_type="password" ref="password" name="password" __={__} tip={true} placeholder={__.password_placeholder} onChange={this.onChange} />
          <Input input_type="password" ref="confirm_password" name="confirm_password" onChange={this.onChange} placeholder={__.confirm_password_placeholder} />
          <Phone ref="phone" name="phone" __={__} onChange={this.onChange} />
          <div key="checkbox" className="checkbox">
            {
              HALO.settings.eula_content ? <div>
                <input name="readme" value="null" type="checkbox" checked={this.state.hasRead} onChange={this.onChange.bind(this, 'readme', '')}/>
                <span>{__.readAgree}<a href={HALO.settings.eula_content}>{__.eula}</a></span>
              </div>
              : null
            }
          </div>
          <input type="submit" className={(state.isSubmitting || !state.canSubmit) ? 'disabled' : ''} value={__.signup} />
        </form>
        <div className="link">
          {__.noAccount}
          <span>|</span>
          {__.isHasAccount}<a href="/login">{__.submit}</a>
        </div>
      </div>
    );
  }
}

module.exports = Model;
