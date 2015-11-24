var React = require('react');
var Model = require('./model');
var Login = React.createClass({
    getInitialState: function() {
        return {
            username: '',
            password: '',
            usernameError: false,
            passwordError: false
        };
    },
    componentDidMount: function() {
        if (!this.model) {
            this.model = new Model();
        }
        this.model.on('loginDone', (function(res) {
            window.location.reload();
        }).bind(this));

        this.model.on('loginFailed', (function(code, msg) {
            this.setState({
                error: msg.error.message
            });
        }).bind(this));
    },
    componentWillUnmount: function() {
        this.model.off('loginDone');
        this.model.off('loginFailed');
    },
    doSubmit: function(e) {
        e.preventDefault();
        if (this.state.username.length * this.state.password.length < 1) {

            this.setState({
                usernameError: this.state.username.length < 1,
                passwordError: this.state.password.length < 1,
                error: undefined
            });
            return;
            
        }
        this.setState({
            error: undefined
        });
        this.model.login(this.state.username, this.state.password);
    },
    onEmailChange: function(e) {
        this.setState({
            username: e.target.value
        });
    },
    onPwdChange: function(e) {
        this.setState({
            password: e.target.value
        });
    },
    render: function() {
        return (
            <form method="POST" onSubmit={this.doSubmit} ref="loginForm">
                <span className="email-icon"></span><input name="email" id="id_email" type="text" autofocus="autofocus" placeholder="邮箱或用户名" className={'email' + (this.state.usernameError?' error':'')} tabIndex="1" onChange={this.onEmailChange} value={this.state.username} />
                <span className="password-icon"></span><input name="password" id="id_password" placeholder="密码" type="password" className={'password' + (this.state.passwordError?' error':'')} tabIndex="2" onChange={this.onPwdChange} value={this.state.password} />
                <div className="tip">
                    {this.state.error && <div className="error">{this.state.error}</div>}
                    <div className="retrieve">
                        <a href="https://www.ustack.com/accounts/password/reset/ " target="_blank" >忘记密码?</a>
                    </div>
                </div>
                <input type="submit" className="submit" value='登录' />
            </form>
        )
    }
});

module.exports = Login;