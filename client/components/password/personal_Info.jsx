const React = require('react');
const {Button} = require('client/uskin/index');
const pop = require('./pop.js');
const fetch = require('client/libs/fetch');

class PersonalInfo extends React.Component {
  constructor(props) {
    super(props);

    let hasPhone = props.HALO.user.phone ? true : false;

    this.state = {
      fold: false,
      phoneNumber: hasPhone ? props.HALO.user.phone : '',
      phoneError: false,
      enableSend: true,
      errorMsg: '',
      showError: false,
      captcha: '',
      captchaError: false,
      btnText: this.props.__.get_captcha
    };

    this.store = {
      hasPhone: hasPhone,
      timer: null,
      count: 60
    };

    ['toggle', 'bindPhone', 'onChange', 'getCaptcha', 'sendCaptcha', 'onCaptchaChange'].forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  toggle() {
    this.setState({
      fold: !this.state.fold
    });
  }

  onChange(evt) {
    const reg = /^1[3,4,5,6,7,8]\d{9}$/;
    let error = false;

    if(reg.test(evt.target.value)) {
      error = false;
    } else {
      error = true;
    }

    this.setState({
      phoneError: error,
      phoneNumber: evt.target.value
    });
  }

  onCaptchaChange(evt) {
    this.setState({
      captcha: evt.target.value
    });
  }

  // 获取短信验证码需要输入图形验证码
  getCaptcha(evt) {
    const reg = /^1[3,4,5,6,7,8]\d{9}$/;
    const state = this.state;
    if(!reg.test(state.phoneNumber)) {
      this.setState({
        phoneError: true
      });
      return;
    }

    pop({
      phone: state.phoneNumber,
      __: this.props.__
    }, null, this.sendCaptcha);
  }

  // 请求发送短信验证码
  sendCaptcha(picCaptcha) {
    const __ = this.props.__;

    this.setState({
      showError: false,
      errorMsg: '',
      captchaError: false,
      enableSend: false,
      btnText: __.sending
    });

    fetch.post({
      url: '/api/user/phone/captcha',
      data: {
        phone: this.state.phoneNumber,
        captcha: picCaptcha
      }
    }).then((res) => {
      this.startTimer();
    }).catch((err) => {
      let errorMsg = '';
      try {
        errorMsg = JSON.parse(err.responseText).message;
      } catch(e) {
        errorMsg = __.unknown_error;
      }

      this.setState({
        enableSend: true,
        btnText: __.get_captcha,
        showError: true,
        errorMsg: errorMsg
      });
    });
  }

  // 绑定手机号
  bindPhone() {
    const __ = this.props.__;
    const state = this.state;

    this.setState({
      phoneError: false,
      captchaError: false,
      showError: false,
      errorMsg: ''
    });

    if(!/^1[3,4,5,6,7,8]\d{9}$/.test(state.phoneNumber)) {
      this.setState({
        phoneError: true,
        showError: true,
        errorMsg: __.wrong_phone_number
      });
      return;
    }

    if(!/^\d{6}$/.test(state.captcha)) {
      this.setState({
        captchaError: true,
        showError: true,
        errorMsg: __.wrong_captcha_format
      });
      return;
    }

    fetch.post({
      url: '/api/user/phone',
      data: {
        phone: state.phoneNumber,
        code: state.captcha
      }
    }).then(() => {
      window.location.reload();
    }).catch((err) => {
      let errorMsg = '';
      try {
        errorMsg = JSON.parse(err.responseText).message;
      } catch(e) {
        errorMsg = __.unknown_error;
      }

      this.setState({
        showError: true,
        errorMsg: errorMsg
      });
    });
  }

  startTimer() {
    const __ = this.props.__;

    this.store.timer = setInterval(() => {
      if(this.store.count === 0) {
        clearInterval(this.store.timer);
        this.store.timer = null;
        this.store.count = 60;
        this.setState({
          enableSend: true,
          btnText: __.get_captcha
        });
      } else {
        this.store.count--;
        this.setState({
          btnText: __.resend_captcha.replace(/\{0\}/, this.store.count)
        });
      }
    }, 1000);
  }

  renderContent() {
    const __ = this.props.__;
    const HALO = this.props.HALO;
    const state = this.state;
    const user = HALO.user;
    const hasPhone = this.store.hasPhone;
    const currPjt = HALO.user.projects.find((project) => {
      return project.id === user.projectId;
    });
    const currPjtName = currPjt !== undefined ? currPjt.name : '';

    return (
      <div className="personal-info-content-wrapper">
        <div key="1">
          <div className="title">{ __.user_name }</div>
          <div className="content">{ user.username || '' }</div>
        </div>
        <div key="2">
          <div className="title">{ __.user_id }</div>
          <div className="content">{ user.userId || ''}</div>
        </div>
        <div key="3">
          <div className="title">{ __.current_project_id }</div>
          <div className="content">{ user.projectId || ''}</div>
        </div>
        <div key="4">
          <div className="title">{ __.current_project_name }</div>
          <div className="content">{ currPjtName }</div>
        </div>
        <div key="5">
          <div className="title">{ __.phone_number }</div>
          <div className="content phone-content">
            { hasPhone ? state.phoneNumber :
              <div>
                <input type="text" className={state.phoneError ? 'error' : ''} value={state.phoneNumber} autoComplete="false" onChange={this.onChange} />
                <div className="not-bound-tip">{ __.did_not_bound_phone }</div>
              </div>
            }
          </div>
        </div>
        { hasPhone ? null :
          <div key="6">
            <div className="title">{__.sms_captcha}</div>
            <div className="content">
              <input type="text" className={ state.captchaError ? 'error' : '' } onChange={ this.onCaptchaChange }/>
              <Button value={ state.btnText } onClick={ this.getCaptcha } disabled={ !state.enableSend }/>
              <div className={ 'error-msg-tip' + (state.showError ? '' : ' hide') }>{ state.errorMsg }</div>
            </div>
          </div>
        }
        { hasPhone ? null :
          <div key="7" className="bind-btn-wrapper">
            <Button value={ __.bind_phone_number } onClick={ this.bindPhone } />
          </div>
        }
      </div>
    );
  }

  render() {
    const state = this.state;
    const __ = this.props.__;

    return (
      <div className="toggle">
        <div className="toggle-title" onClick={ this.toggle }>
          { __.personal_info }
          <i className={ 'glyphicon icon-arrow-' + (state.fold ? 'down' : 'up') } />
        </div>
        <div className={ 'toggle-content' + (state.fold ? ' fold' : ' unfold') }>
          { this.renderContent() }
        </div>
      </div>
    );
  }
}

module.exports = PersonalInfo;
