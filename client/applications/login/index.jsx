require('./style/index.less');

var ReactDOM = require('react-dom');
var React = require('react');
var Model = require('./model');
var __ = require('i18n/client/lang.json');

var loginModel = React.createFactory(Model);

ReactDOM.render(
  loginModel({
    accountPlaceholder: __.account_placeholder,
    pwdPlaceholder: __.pwd_placeholder,
    errorTip: __.error_tip,
    submit: __.submit
  }),
  document.getElementsByClassName('input-wrapper')[0]
);
