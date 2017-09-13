const React = require('react');
const NavBar = require('client/components/navbar/index');
const SideMenu = require('client/components/side_menu/index');
const router = require('client/utils/router');

require('./cores/ws');
require('client/utils/router_delegate');
require('./cores/watchdog');

const loader = require('./cores/loader'),
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

    let pathList = router.getPathList();
    if (pathList.length <= 1) {
      pathList[1] = configs.default_module;
    }
    router.replaceState('/dashboard/' + pathList.slice(1).join('/'), null, null, true);
  }

  onChangeState(pathList) {
    if (this.isValidPath(pathList)) {
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
      router.replaceState('/dashboard/overview');
    }
  }

  isValidPath(pathList) {
    let isValid = true;

    if (pathList.length > 1) {
      isValid = this.menuKeys.some((ele) => ele === pathList[1]);
    }

    return isValid;
  }

  getMenuKeys() {
    let menuKeys = [];

    this.props.menus.forEach((ele) => {

      if (ele.title !== 'monitor') {
        ele.items.forEach((item) => {
          menuKeys.push(item);
        });
      } else {
        if (HALO.settings.enable_alarm) {
          ele.items.forEach((item) => {
            menuKeys.push(item);
          });
        }
      }

    });

    configs.routers.forEach(r => {
      menuKeys.push(r.key);
    });

    configs.hidden.forEach(h => {
      menuKeys.push(h);
    });

    return menuKeys;
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
    this.menuKeys = this.getMenuKeys();
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

    props.menus.forEach((m) => {
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
    }

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
                let M = modules[m];
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
      let b = configs.routers.some((n) => {
        if (n.key === i) {
          return true;
        }
        return false;
      });
      let h = configs.hidden ? configs.hidden.some((hide) => {
        if (hide === i) {
          return true;
        }
        return false;
      }) : null;
      return !b && !h;
    });
  });
  return modules;
}

Model.defaultProps = {
  menus: filterMenu(configs.modules)
};

module.exports = Model;
