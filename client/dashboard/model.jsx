var React = require('react');
var NavBar = require('client/components/navbar/index');
var SideMenu = require('client/components/side_menu/index');

var loader = require('./cores/loader');

class Model extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      data: []
    };
  }

  initialize() {

    this.router.on('popState', this.onPopState);
    this.router.pushState('');
  }

  onPopState(pathList) {
    console.log(pathList);
  }

  componentDidMount() {
    this.router = require('./routers/index');
    this.initialize();
  }

  render() {

    var moduleTmpl = Object.keys(loader.modules).map((m, index) => {

      var M = loader.modules[m];
      return <M key={index} style={loader.configs.default_module === m ? undefined : {display: 'none'}} />;
    });

    return (
      <div id="wrapper">
        <div id="navbar">
          <NavBar />
        </div>
        <div id="main-wrapper">
          <SideMenu />
          <div id="main">
            {moduleTmpl}
          </div>
        </div>
      </div>
    );
  }

}

module.exports = Model;
