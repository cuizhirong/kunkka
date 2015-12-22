var React = require('react');

var request = require('../../mixins/request');

var Model = React.createClass({

  doSubmit: function(e) {
    e.preventDefault();

    var refs = this.refs;

    request.post({
      url: '/auth/login',
      data: {
        username: refs.username.value,
        password: refs.pwd.value
      }
    }).then(function(data) {
      document.querySelector('.input-error').classList.toggle('hide');
      window.location = '/index';
    }, function(err) {
      document.querySelector('.input-error').classList.toggle('hide');
    });

  },

  render: function() {
    var props = this.props;

    return (
      <form method="POST" onSubmit={this.doSubmit}>
        <input type="text" ref="username" placeholder={props.accountPlaceholder} autoFocus="autofocus" autoComplete="off" />
        <input type="password" ref="pwd" placeholder={props.pwdPlaceholder} autoComplete="off" />
        <div className="tip-wrapper">
          <div className="input-error hide">
            <i className="glyphicon icon-status-warning"></i><span>{props.errorTip}</span>
          </div>
        </div>
        <input type="submit" value={props.submit} />
      </form>
    );
  }
});

module.exports = Model;
