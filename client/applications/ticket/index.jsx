require('./style/index.less');

var ReactDOM = require('react-dom');
var React = require('react');
var Model = require('./model');
var __ = require('locale/client/ticket.lang.json');

var dashboardModel = React.createFactory(Model);

ReactDOM.render(
  dashboardModel({
    __: __,
    HALO: HALO
  }),
  document.getElementById('container')
);
