var React = require('react');
var request = require('client/libs/ajax');

class Model extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      loginError: false,
      usernameEmptyError: false,
      pwdEmptyError: false,
      isSubmitting: false
    };

    this.onSubmit = this.onSubmit.bind(this);
  }

  onSubmit(e) {
    e.preventDefault();

    if (this.state.isSubmitting) {
      return;
    }

    var refs = this.refs,
      that = this,
      username = refs.username.value,
      pwd = refs.pwd.value;

    that.setState({
      loginError: false,
      usernameEmptyError: false,
      pwdEmptyError: false
    });

    var isEmpty = !username || !pwd;
    if (isEmpty) {
      if (!username) {
        that.setState({
          usernameEmptyError: true
        });
      }
      if (!pwd) {
        that.setState({
          pwdEmptyError: true
        });
      }
      return;
    }

    that.setState({
      isSubmitting: true
    });
    request.post({
      url: '/auth/login',
      dataType: 'json',
      contentType: 'application/json',
      data: {
        username: username,
        password: pwd
      }
    }).then(function(data) {
      window.location = window.location.pathname;
    }, function(err) {
      that.setState({
        loginError: true,
        isSubmitting: false
      });
    });

  }

  render() {
    var props = this.props,
      state = this.state,
      __ = props.__;

    return (
      <form method="POST" onSubmit={this.onSubmit}>
        <input type="text" ref="username" className={state.usernameEmptyError ? 'error' : ''} placeholder={__.account_placeholder} autoFocus="autofocus" autoComplete="off" />
        <input type="password" ref="pwd" className={state.pwdEmptyError ? 'error' : ''} placeholder={__.pwd_placeholder} autoComplete="off" />
        <div className="tip-wrapper">
          <div className={'input-error' + (state.loginError ? '' : ' hide')}>
            <i className="glyphicon icon-status-warning"></i><span>{__.error_tip}</span>
          </div>
        </div>
        <input type="submit" className={state.isSubmitting ? 'disabled' : ''} value={__.submit} />
      </form>
    );
  }
}

module.exports = Model;
