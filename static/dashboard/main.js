var React = require('react');

var Dashboard = React.createClass({
    getInitialState: function() {
        this.router = require('./routers');

        this.router.on('popState', this.onPopState);
        return {
            currentView: this.router.getCurrentView()
        };
    },
    onPopState: function() {
        this.setState({
            currentView: this.router.getCurrentView()
        });
    },
    render: function() {
        var Model = require('./modules/servers');// + this.state.currentView);
        
        return (
            <Model />
        )
    }
});

module.exports = Dashboard;