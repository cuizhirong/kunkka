require('./style/index.less');

var ReactDOM = require('react-dom');
var React = require('react');
var Model = require('./model');

var dashboardModel = React.createFactory(Model);

ReactDOM.render(
  dashboardModel(),
  document.getElementById('container')
);
