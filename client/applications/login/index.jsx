require('./style/index.less');

var ReactDOM = require('react-dom');
var React = require('react');
var Model = require('./model');
var __ = require('locale/client/login.lang.json');

var loginModel = React.createFactory(Model);

ReactDOM.render(
  loginModel({
    HALO: HALO,
    __: __
  }),
  document.getElementsByClassName('input-wrapper')[0]
);
