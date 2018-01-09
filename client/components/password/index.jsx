require('./style/index.less');

const React = require('react');
const {Tab, Button} = require('client/uskin/index');
const InputPassword = require('client/components/modal_common/subs/input_pwd/index');
const converter = require('./converter');

const config = require('./config.json');
const fetch = require('client/libs/fetch');
const AES = require('crypto-js/aes');

class Model extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      config: config,
      toggle: true,
      btnText: props.__.get_captcha,
      enable_send: true,
      showCaptchaError: false,
      captchaErrorMsg: '',
      showError: false,
      errorMsg: ''
    };

    let needCaptcha = false;
    if(HALO.user && HALO.user.roles !== undefined) {
      needCaptcha = HALO.user.roles.some((role) => {
        return role === 'admin';
      });
    }

    needCaptcha = needCaptcha && HALO.settings.enable_safety;

    this.store = {
      timer: null,
      count: 60,
      needCaptcha: needCaptcha
    };

    ['toggle', 'onAction', 'modify', 'back'].forEach((m) => {
      this[m] = this[m].bind(this);
    });
  }

  componentWillMount() {
    //In case of having 2 or more external network, show the floating_network of the floating ip.
    converter.convertLang(this.props.__, config);
  }

  toggle(e) {
    this.setState({
      toggle: !this.state.toggle
    });
  }

  onAction() {}

  componentWillReceiveProps(nextProps) {
    document.getElementsByClassName('pwd')[0].style.display = 'block';
    document.getElementById('main-wrapper').removeChild(document.getElementsByClassName('pwd')[1]);
  }

  back() {
    document.getElementById('main').style.display = 'block';
    document.getElementsByClassName('pwd')[0].style.display = 'none';

    let haloMenu = document.getElementsByClassName('halo-com-menu')[0];
    haloMenu.style.width = '';
    haloMenu.style.minWidth = '';
    haloMenu.style.maxWidth = '';
    haloMenu.style.overflowX = '';
  }

  modify() {
    let newPwd = this.refs.new_pwd.state.value,
      confirmPwd = this.refs.confirm_pwd.state.value,
      originalPwd = this.refs.original_pwd.state.value;
    const __ = this.props.__;

    ['original_pwd', 'new_pwd', 'confirm_pwd'].forEach(m => {
      this.refs[m].setState({
        error: !this.refs[m].state.value
      });
    });

    this.setState({
      showError: false,
      errorMsg: '',
      showCaptchaError: false,
      captchaErrorMsg: ''
    });

    if (newPwd !== confirmPwd || !/^\w{8,20}$/.test(newPwd) || !/\d+/.test(newPwd) || !/[a-z]+/.test(newPwd) || !/[A-Z]+/.test(newPwd)) {
      this.refs.new_pwd.setState({
        error: true
      });
      this.refs.confirm_pwd.setState({
        error: true
      });
      return;
    }

    if(this.store.needCaptcha) {
      const captcha = this.refs.captcha.value.trim();
      if(!/^\d{6}$/.test(captcha)) {
        this.setState({
          showCaptchaError: true,
          captchaErrorMsg: __.captcha_error
        });
        return;
      }
    }

    this.getEncryptionKey().then((response) => {
      // password encrypt
      const originalCipherObject = AES.encrypt(originalPwd, response.uuid);
      const newCipherObject = AES.encrypt(newPwd, response.uuid);

      let data = {
        original_password: originalCipherObject.toString(),
        password: newCipherObject.toString()
      };

      if (this.store.needCaptcha) {
        data.captcha = this.refs.captcha.value.trim();
      }

      fetch.post({
        url: '/api/password/change',
        data: data
      }).then((res) => {
        window.location = '/auth/logout';
      }).catch((error) => {
        let errorMsg;
        try {
          errorMsg = JSON.parse(error.responseText).message;
        } catch (e) {
          errorMsg = __.unknown_error;
        }

        this.setState({
          showError: true,
          errorMsg: errorMsg
        });
      });
    }).catch((err) => {
      const errorMsg = __.unknown_error;
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
          enable_send: true,
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

  getCaptcha() {
    const __ = this.props.__;
    this.setState({
      enable_send: false,
      btnText: __.sending,
      showCaptchaError: false,
      captchaErrorMsg: ''
    });

    fetch.post({
      url: '/api/password/change/phone-captcha'
    }).then((res) => {
      this.startTimer();
    }).catch((err) => {
      let errorMsg;
      try {
        errorMsg = JSON.parse(err.responseText).message;
      } catch(e) {
        errorMsg = __.unknown_error;
      }
      this.setState({
        enable_send: true,
        btnText: __.get_captcha,
        showCaptchaError: true,
        captchaErrorMsg: errorMsg
      });
    });
  }


  getEncryptionKey() {
    const random = Date.now().toString().slice(-6);
    return fetch.get({
      url: '/api/password/uuid?' + random
    });
  }

  renderCaptcha() {
    const __ = this.props.__;
    const state = this.state;

    return (
      <div className="captcha-wrapper">
        <div className="modal-row captcha-row">
          <span>{__.sms_captcha} </span>
          <input type="text" ref="captcha" className={ state.showCaptchaError ? 'error' : '' } />
          <Button value={state.btnText} onClick={this.getCaptcha.bind(this)} ref="get_captcha_btn" disabled={!state.enable_send} />
        </div>
        <div className={'error-tip' + (state.showCaptchaError ? '' : ' hide')}>
          { state.captchaErrorMsg }
        </div>
      </div>
    );
  }

  render() {
    let _config = this.state.config,
      tabs = _config.tabs,
      inputs = _config.fields,
      __ = this.props.__,
      state = this.state;

    return (
      <div className="halo-module-password" style={this.props.style}>
        {tabs ?
          <div className="submenu-tabs">
            <Tab items={tabs}/>
            <div className="back">
              <Button value={__.back} onClick={this.back} />
            </div>
          </div>
          : null
        }
        <div className="toggle">
          <div className="toggle-title" onClick={this.toggle}>
            {__.modify_pwd}
            <i className={'glyphicon icon-arrow-' + (state.toggle ? 'up' : 'down')} />
          </div>
          <div className={'toggle-content' + (state.toggle ? ' unfold' : ' fold')}>
            <div className="modal-bd halo-com-modal-common">
              {
                inputs.map((m, i) => {
                  return <InputPassword key={m.field} ref={m.field} label={__[m.field]} __={__} onAction={this.onAction}
                  tip_info={ i === 1 ? 'pwd_tip' : false } />;
                })
              }
              { this.store.needCaptcha ? this.renderCaptcha() : null }
              <div className="row"><Button value={__.modify} onClick={this.modify}/></div>
              <div className={'row pwd_fail' + (state.showError ? '' : ' hide')}>
                <i className="glyphicon icon-status-warning" />
                <span>{state.errorMsg}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

}

module.exports = Model;
