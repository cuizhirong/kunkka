require('./style/index.less');

var ReactDOM = require('react-dom');
var React = require('react');
var Model = require('./model');
var __ = require('locale/client/auth.lang.json');

var loginModel = React.createFactory(Model);

ReactDOM.render(
  loginModel({
    HALO: HALO,
    __: __,
    path: window.location.pathname
  }),
  document.getElementsByClassName('input-wrapper')[0]
);
