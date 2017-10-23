require('./style/index.less');

const ReactDOM = require('react-dom');
const React = require('react');
const Model = require('./model');
const __ = require('locale/client/login.lang.json');

const loginModel = React.createFactory(Model);

ReactDOM.render(
  loginModel({
    HALO: HALO,
    __: __
  }),
  document.getElementsByClassName('input-wrapper')[0]
);
