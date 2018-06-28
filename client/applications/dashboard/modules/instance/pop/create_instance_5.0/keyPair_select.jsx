const React = require('react');

const { Tip, Tooltip } = require('client/uskin/index');

const getOsCommonName = require('client/utils/get_os_common_name');

class KeyPaireSelect extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedKey: 'keypair',
      selectKeyPair: props.prevState.keypairs.length > 0 && props.prevState.keypairs[0].name,
      firstEye: false,
      secEye: false,
      showPwdTip: false,
      pwd: '',
      username: '',
      hideKeypair: false
    };
  }

  onClickTab(key) {
    this.setState({
      selectedKey: key
    }, this.props.onChange && this.props.onChange(key, 'credentialType'));
  }

  onChangeKeyPair(e) {
    this.setState({
      selectKeyPair: e.target.value
    }, this.props.onChange && this.props.onChange(e.target.value, 'keypair'));
  }

  checkPsw(pwd) {
    return (pwd.length < 8 || pwd.length > 20 || !/^[a-zA-Z0-9]/.test(pwd) || !/[a-z]+/.test(pwd) || !/[A-Z]+/.test(pwd) || !/[0-9]+/.test(pwd));
  }

  onChangePwd(e) {
    let pwd = e.target.value;
    let pwdError = this.checkPsw(pwd),
      confirmPwdError = (this.state.confirmPwd !== pwd) || pwdError;

    this.setState({
      pwdError: pwdError,
      showPwdTip: true,
      pwd: pwd,
      confirmPwdError: confirmPwdError
    }, () => {
      let func = this.props.onChange;
      func && func(pwd, 'pwd');
      func && func(confirmPwdError, 'pwdError');
    });
  }

  onFocusPwd(e) {
    let isError = this.checkPsw(this.state.pwd);

    this.setState({
      showPwdTip: isError
    });
  }

  onBlurPwd(e) {
    this.setState({
      showPwdTip: false
    });
  }

  onChangeConfirmPwd(e) {
    let pwd = e.target.value;
    let pwdError = !(pwd === this.state.pwd);

    this.setState({
      confirmPwdError: pwdError,
      confirmPwd: pwd
    }, this.props.onChange && this.props.onChange(pwdError, 'pwdError'));
  }

  onClickEye(key) {
    this.setState({
      [key]: !this.state[key]
    });
  }

  getImageAdminUserName(image) {
    let username = 'root';
    if (image) {
      if (image.os_admin_user) {
        username = image.os_admin_user;
      } else if (image.image_meta) {
        try {
          username = JSON.parse(image.image_meta).os_username || 'root';
        } catch (e) {
          username = 'root';
        }
      }
    }

    return username;
  }

  renderPassword(props, state) {
    let username = this.getImageAdminUserName(props.prevState.image);

    return <div className="password">
      <div className="user-name">
        <label>{__.user_name}</label>
        <input value={username} disabled={true} onChange={this.onChangeName}/>
      </div>
      <div className="user-name">
        <label>{__.password}</label>
        <div>
          {state.showPwdTip ?
            <Tooltip content={__.pwd_tip} width={214} shape="top-left" type={'error'} hide={!state.pwdError} />
          : null}
          <input placeholder={__.pwd_placeholder}
            value={state.pwd}
            type={state.firstEye ? 'text' : 'password'}
            onFocus={this.onFocusPwd.bind(this)}
            onBlur={this.onBlurPwd.bind(this)}
            onChange={this.onChangePwd.bind(this)}/>
          <i className={'glyphicon icon-eye' + (state.firstEye ? ' selected' : '')}
            onClick={this.onClickEye.bind(this, 'firstEye')}/>
        </div>
      </div>
      <div className="user-name">
        <label></label>
        <div>
          <input placeholder={__.confirm_pwd_placeholder}
            type={state.secEye ? 'text' : 'password'}
            value={state.confirmPwd}
            className={state.confirmPwdError ? 'error' : null}
            onChange={this.onChangeConfirmPwd.bind(this)}/>
          <i className={'glyphicon icon-eye' + (state.secEye ? ' selected' : '')}
            onClick={this.onClickEye.bind(this, 'secEye')}/>
        </div>
      </div>
    </div>;
  }

  render() {
    let state = this.state,
      props = this.props;

    let osCommonName = getOsCommonName(props.prevState.image) === 'windows',
      hideKeypair = osCommonName ? true : false,
      keypairClass = state.selectedKey === 'keypair' ? 'tab-item selected' : 'tab-item',
      passwordClass = state.selectedKey === 'password' || hideKeypair ? 'tab-item selected' : 'tab-item',
      keypairFunc = state.selectedKey === 'keypair' ? null : this.onClickTab.bind(this, 'keypair'),
      passwordFunc = state.selectedKey === 'password' ? null : this.onClickTab.bind(this, 'password');

    return <div className="keypair-select">
      <div className="tab">
        <div className={hideKeypair ? 'hide' : keypairClass}
          onClick={keypairFunc}>{__.keypair}</div>
        <div className={passwordClass}
          onClick={passwordFunc}>{__.password}</div>
      </div>
      {state.selectedKey === 'keypair' && !hideKeypair ? <div className="keypair">
        <select onChange={this.onChangeKeyPair.bind(this)}>
          {
            props.prevState.keypairs && props.prevState.keypairs.map(function(keypair) {
              return <option key={keypair.name} value={keypair.name}>{keypair.name}</option>;
            })
          }
        </select>
      </div> : this.renderPassword(props, state)}
      <div className="credential-tips" key="tips">
        <Tip content={__.instance_credential_tip} type="warning" showIcon={true} />
      </div>
    </div>;
  }
}

module.exports = KeyPaireSelect;
