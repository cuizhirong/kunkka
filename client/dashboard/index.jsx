require('./style/index.less');

var ReactDOM = require('react-dom');
var React = require('react');
var Model = require('./model.jsx');


// var Dashboard = React.createClass({
//   getInitialState: function() {
//     this.router = require('./routers');

//     this.router.on('popState', this.onPopState);
//     return {
//       currentView: this.router.getCurrentView()
//     };
//   },
//   onPopState: function() {
//     this.setState({
//       currentView: this.router.getCurrentView()
//     });
//   },
//   render: function() {
//     var Model = require('./modules/servers'); // + this.state.currentView);

//     return (
//       <Model />
//     );
//   }
// });

// ReactDOM.render(
//   React.createElement(Dashboard),
//   document.getElementById('content')
// );

var dashboardModel = React.createFactory(Model);

ReactDOM.render(
  dashboardModel(),
  document.getElementById('container')
);
