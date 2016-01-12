var React = require('react');
var NavBar = require('client/components/navbar/index');
var SideMenu = require('client/components/side_menu/index');

var loader = require('./cores/loader');

class Model extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      modules: Object.keys(loader.modules)
    };

    this.onClickSubmenu = this.onClickSubmenu.bind(this);
    this.onChangeState = this.onChangeState.bind(this);
  }

  loadRouter() {
    this.router = require('./routers/index');
    this.router.on('changeState', this.onChangeState);

    var pathList = this.router.getPathList();
    if (pathList.length > 1) {
      loader.configs.default_module = pathList[1];
    } else {
      this.router.replaceState('/project/' + loader.configs.default_module);
    }
  }

  onChangeState(pathList) {
    this.setState({
      default_module: pathList[1]
    });
  }

  updateModules() {
    this.setState({
      modules: Object.keys(loader.modules),
      default_module: loader.configs.default_module
    });
  }

  componentDidMount() {
    this.loadRouter();
    this.updateModules();
  }

  onClickSubmenu(e, m) {
    this.router.pushState('/project/' + m.key);
  }

  render() {
    var state = this.state;
    var modules = loader.modules;

    var submenu = [];

    state.modules.forEach((m) => {
      submenu.push({
        subtitle: m.toUpperCase(),
        key: m,
        onClick: this.onClickSubmenu,
        iconClass: 'glyphicon icon-' + m,
        selected: m === state.default_module ? true : false
      });
    });

    var items = [{
      title: 'Project',
      key: 'project',
      submenu: submenu
    }];

    return (
      <div id="wrapper">
        <div id="navbar">
          <NavBar />
        </div>
        <div id="main-wrapper">
          <SideMenu items={items} />
          <div id="main">
            {
              state.modules.map((m, index) => {
                var M = modules[m];
                return <M key={index} style={state.default_module === m ? undefined : {display: 'none'}} />;
              })
            }
          </div>
        </div>
      </div>
    );
  }

}

module.exports = Model;
