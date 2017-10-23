require('./style/index.less');

const ReactDOM = require('react-dom');
const React = require('react');
const Model = require('./model');
const __ = require('locale/client/admin.lang.json');

const dashboardModel = React.createFactory(Model);

ReactDOM.render(
  dashboardModel({
    __: __,
    HALO: HALO
  }),
  document.getElementById('container')
);
