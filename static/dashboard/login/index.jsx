require('../../style/login/index.less');

var ReactDOM = require('react-dom');
var React = require('react');
var Login = require('./model.jsx');

var loginModel = React.createFactory(Login);

ReactDOM.render(
  loginModel({
    accountPlaceholder: __('accountPlaceholder'),
    pwdPlaceholder: __('pwdPlaceholder'),
    errorTip: __('errorTip'),
    submit: __('submit')
  }),
  document.getElementsByClassName('input-wrapper')[0]
);
