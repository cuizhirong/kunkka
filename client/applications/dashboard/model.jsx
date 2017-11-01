const React = require('react');
const NavBar = require('client/components/navbar/index');
const SideMenu = require('client/components/side_menu/index');
const router = require('client/utils/router');

require('./cores/ws');
require('client/utils/router_delegate');
require('./cores/watchdog');

const loader = require('./cores/loader'),
  configs = loader.configs;

const isPathValid = require('client/libs/path_valid');

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

    let pathList = router.getPathList();
    if (pathList.length <= 1) {
      pathList[1] = configs.default_module;
    }
    router.replaceState('/dashboard/' + pathList.slice(1).join('/'), null, null, true);
  }

  onChangeState(pathList) {
    if (isPathValid(pathList, configs)) {
      let _moduleName = pathList[1],
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
    } else {
      router.replaceState('/dashboard/' + configs.default_module);
    }
  }

  _filterMenu(item) {
    let ret = item;
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
    router.pushState('/dashboard/' + m.key);
  }

  getIcon(name) {
    switch(name) {
      case 'loadbalancer':
        return 'lb';
      case 'instance-snapshot':
        return 'snapshot';
      case 'alarm':
        return 'monitor';
      case 'back-up':
        return 'backup';
      case 'orchestration':
        return 'template-list';
      case 'volume-private':
        return 'volume';
      case 'volume-public':
        return 'volume';
      default:
        return name;
    }
  }

  render() {
    let state = this.state,
      props = this.props,
      __ = props.__,
      HALO = props.HALO,
      modules = loader.modules,
      menus = [];

    configs.modules.forEach((m) => {
      let submenu = [];
      m.items.forEach((n, i) => {
        submenu.push({
          subtitle: __[n],
          key: n,
          onClick: this.onClickSubmenu,
          iconClass: 'glyphicon icon-' + this.getIcon(n),
          selected: n === state.selectedMenu ? true : false
        });
      });

      menus.push({
        title: __[m.title],
        key: m.title || 'overview',
        submenu: submenu
      });
    });

    if (!HALO.settings.enable_alarm) {
      let index = -1;
      menus.some((ele, i) => ele.key === 'monitor' ? (index = i, true) : false);

      if (index > -1) {
        menus.splice(index, 1);
      }
    } else if (!HALO.settings.enable_orchestration) {
      let index = -1;
      menus.some((ele, i) => ele.key === 'orchestration' ? (index = i, true) : false);

      if (index > -1) {
        menus.splice(index, 1);
      }
    }

    return (
      <div id="wrapper">
        <div id="navbar">
          <NavBar HALO={HALO} __={__} project={true} region={true} setting={true} />
        </div>
        <div id="main-wrapper">
          <SideMenu items={menus} application={HALO.application} />
          <div id="main">
            <div className="inner">
              {
                state.modules.map((m, index) => {
                  let M = modules[m];
                  if (M) {
                    return <M key={index} params={state.params} style={state.selectedModule === m ? {display: 'flex'} : {display: 'none'}} />;
                  }
                })
              }
            </div>
          </div>
        </div>
      </div>
    );
  }

}

module.exports = Model;
