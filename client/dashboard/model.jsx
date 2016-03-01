var React = require('react');
var NavBar = require('client/components/navbar/index');
var SideMenu = require('client/components/side_menu/index');
var router = require('./cores/router');

require('./utils/router_delegate');

var loader = require('./cores/loader'),
  configs = loader.configs;

class Model extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      modules: [],
      params: []
    };

    this.onClickSubmenu = this.onClickSubmenu.bind(this);
    this.onChangeState = this.onChangeState.bind(this);
  }

  loadRouter() {
    router.on('changeState', this.onChangeState);

    var pathList = router.getPathList();
    if (pathList.length <= 1) {
      pathList[1] = configs.default_module;
    }
    router.replaceState('/project/' + pathList.slice(1).join('/'), null, null, true);
  }

  onChangeState(pathList) {
    var _moduleName = pathList[1],
      modules = this.state.modules;
    if (modules.indexOf(_moduleName) === -1) {
      modules = modules.concat(_moduleName);
    }
    if (this.state.selectedModule === _moduleName) {
      return;
    }
    this.setState({
      modules: modules,
      selectedModule: pathList[1],
      selectedMenu: this._filterMenu(_moduleName),
      params: pathList
    });
  }

  _filterMenu(item) {
    var ret = item;
    configs.routers.some((m) => {
      if (item === m.key) {
        ret = m.link;
        return true;
      }
      return false;
    });
    return ret;
  }

  componentDidMount() {
    this.loadRouter();
  }

  componentWillUpdate() {
    console.time('dashboard');
  }

  componentDidUpdate() {
    console.timeEnd('dashboard');
  }

  onClickSubmenu(e, m) {
    router.pushState('/project/' + m.key);
  }

  render() {
    var state = this.state,
      props = this.props,
      __ = props.language;
    var modules = loader.modules;

    var submenu = [];

    props.menus.forEach((m) => {
      submenu.push({
        subtitle: __[m],
        key: m,
        onClick: this.onClickSubmenu,
        iconClass: 'glyphicon icon-' + m,
        selected: m === state.selectedMenu ? true : false
      });
    });

    var items = [{
      title: __.project,
      key: 'project',
      submenu: submenu
    }];

    return (
      <div id="wrapper">
        <div id="navbar">
          <NavBar username={this.props.username} />
        </div>
        <div id="main-wrapper">
          <SideMenu items={items} />
          <div id="main">
            {
              state.modules.map((m, index) => {
                var M = modules[m];
                if (M) {
                  return <M key={index} params={state.params} style={state.selectedModule === m ? {display: 'flex'} : {display: 'none'}} />;
                }
              })
            }
          </div>
        </div>
      </div>
    );
  }

}

function filterMenu(list) {
  return list.filter((m) => {
    var b = configs.routers.some((n) => {
      if (n.key === m) {
        return true;
      }
      return false;
    });
    return !b;
  });
}

Model.defaultProps = {
  menus: filterMenu(Object.keys(loader.modules))
};

module.exports = Model;
