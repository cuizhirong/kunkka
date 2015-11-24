var React = require('react');
var Header = require('./header.jsx');

var Login = React.createClass({
    render: function() {
        return (
            <html>
                <Header title={this.props.title} style={['https://dn-ustack.qbox.me/login.css']} />
                <body>
                    <div className="wrapper">
                        <div className="before"></div>
                        <div className="con">
                          <a href="https://www.ustack.com">
                              <div className="logo" style={{backgroundImage: 'url(\'https://dn-ustack.qbox.me/login-logo.png\')', backgroundSize: 'contain'}}></div>
                          </a>
                          <div id="loginForm"></div>
                          <div className="signup">
                              没有账号?
                              <a href="https://www.ustack.com/accounts/register/" target="_blank" >
                                  注册
                              </a>
                          </div>
                        </div>
                        <div className="after"></div>
                    </div>
                    <script src="/static/main-login.min.js"></script>
                </body>
            </html>
        )
    }
});

module.exports = Login;