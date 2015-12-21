var React = require('react');

var Modal = React.createClass({
  render: function() {
    return (
      <div>
      <input type="text" placeholder="请输入账号" autoFocus="autofocus" autoComplete="off" />
      <input type="password" placeholder="请输入密码" autoComplete="off" />
      <div className="tip-wrapper">
        <div className="input-error hide">
          <i className="glyphicon icon-status-warning"></i><span>用户名不正确</span>
        </div>
      </div>
      <input type="submit" value="立即登录" />
      </div>
    );
  }
});

module.exports = Modal;
