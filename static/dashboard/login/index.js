require('../../style/login/index.less');

var ReactDOM = require('react-dom');
var React = require('react');
var Login = require('./model.jsx');

var loginModel = React.createFactory(Login);

ReactDOM.render(
  loginModel({
    accountPlaceholder: '请输入账号',
    pwdPlaceholder: '请输入密码',
    errorTip: '用户名不正确',
    submit: '立即登录'
  }),
  document.getElementsByClassName('input-wrapper')[0]
);
