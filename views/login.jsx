var React = require('react');

var Login = React.createClass({
    render: function() {
        return (
            <html>
                <head>
                    <meta charSet={'utf-8'} />
                    <meta httpEquiv="X-UA-Compatible" content="IE=Edge" />
                    <title>{this.props.title}</title>
                    <link rel="shortcut icon" href="https://dn-ustack.qbox.me/favicon.ico" type="image/x-icon"/>
                    <link rel="stylesheet" href="https://dn-ustack.qbox.me/login.css"/>
                </head>
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
                    <script src="/static/main-main.min.js"></script>
                </body>
            </html>
        )
    }
});

module.exports = Login;