var React = require('react');
var NavBar = require('client/components/navbar/index');
var SideMenu = require('client/components/side_menu/index');
var router = require('client/utils/router');

require('client/utils/router_delegate');

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
    router.replaceState('/admin/' + pathList.slice(1).join('/'), null, null, true);
  }

  onChangeState(pathList) {
    var _moduleName = pathList[1],
      modules = this.state.modules;
    if (modules.indexOf(_moduleName) === -1) {
      modules = modules.concat(_moduleName);
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
    console.time('admin');
  }

  componentDidUpdate() {
    console.timeEnd('admin');
  }

  onClickSubmenu(e, m) {
    router.pushState('/admin/' + m.key);
  }

  render() {
    var state = this.state,
      props = this.props,
      __ = props.__,
      HALO = props.HALO,
      modules = loader.modules,
      menus = [];

    props.menus.forEach((m) => {
      var submenu = [];
      m.items.forEach((n) => {
        submenu.push({
          subtitle: __[n],
          key: n,
          onClick: this.onClickSubmenu,
          iconClass: 'glyphicon icon-' + n,
          selected: n === state.selectedMenu ? true : false
        });
      });
      menus.push({
        title: __[m.title],
        key: m.title || 'overview',
        submenu: submenu
      });
    });

    return (
      <div id="wrapper">
        <div id="navbar">
          <NavBar HALO={HALO} __={__} />
        </div>
        <div id="main-wrapper">
          <SideMenu items={menus} application={HALO.application} />
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

function filterMenu(modules) {
  modules.forEach((m) => {
    m.items = m.items.filter((i) => {
      var b = configs.routers.some((n) => {
        if (n.key === i) {
          return true;
        }
        return false;
      });
      return !b;
    });
  });
  return modules;
}

Model.defaultProps = {
  menus: filterMenu(configs.modules)
};

module.exports = Model;
