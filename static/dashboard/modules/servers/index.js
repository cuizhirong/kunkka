var React = require('react');

// var Router = require('../../routers');

var ServerDashboard = React.createClass({
  getInitialState: function() {
    var Model = require('./model');
    this.model = new Model();
    this.model.getServers();
    return {
      data: []
    };
  },
  refresh: function() {
    this.model.getServers();
  },
  render: function() {
    return (
      <div id="server"></div>
    );
  }
});

module.exports = ServerDashboard;
