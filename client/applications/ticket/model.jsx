const React = require('react');
const NavBar = require('client/components/navbar/index');
const SideMenu = require('client/components/side_menu/index');
const router = require('client/utils/router');

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
      if (!HALO.configs.ticket.show_apply) {
        pathList[1] = 'manage_ticket';
      } else {
        pathList[1] = configs.default_module;
      }
    } else {
      if (!HALO.configs.ticket.show_apply && pathList[1] === 'ticket') {
        pathList[1] = 'manage_ticket';
      }
      if (!HALO.configs.ticket.show_manage && pathList[1] === 'manage_ticket') {
        pathList[1] = 'ticket';
      }
    }
    router.replaceState('/ticket/' + pathList.slice(1).join('/'), null, null, true);
  }

  onChangeState(pathList) {
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
    router.pushState('/ticket/' + m.key);
  }

  getIcon(name) {
    switch (name) {
      case 'manage_ticket':
        return 'setting';
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
      menus = [],
      ticketConfig = HALO.configs.ticket,
      showApply = ticketConfig.show_apply,
      showManage = ticketConfig.show_manage;

    props.menus.forEach((m) => {
      let submenu = [];
      m.items.forEach((n) => {
        if (!showApply && n === 'ticket') {
          return;
        }
        if (!showManage && n === 'manage_ticket') {
          return;
        }
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
        key: m.title || 'general',
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
      return !b;
    });
  });
  return modules;
}

Model.defaultProps = {
  menus: filterMenu(configs.modules)
};

module.exports = Model;
