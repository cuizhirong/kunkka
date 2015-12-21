require('../../style/login/index.less');

// var ReactDOM = require('react-dom');
// var React = require('react');

// ReactDOM.render(
//   React.createElement(require('./login')),
//   document.getElementById('loginForm')
// );


var Request = require('../../mixins/request');

Request.post({
  url: '/auth/login',
  data: {
    username: 'yaoli',
    password: 'haoren'
  }
}).then(function(data) {
  console.debug(data);
}, function(err) {
  document.querySelector('.input-error').classList.remove('hide');
});
