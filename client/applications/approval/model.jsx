var React = require('react');
var NavBar = require('client/components/navbar/index');
var SideMenu = require('client/components/side_menu/index');
var router = require('client/utils/router');

require('client/utils/router_delegate');
require('./cores/watchdog');

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
    var approval = HALO.configs.approval,
      enableApply = approval.showApply,
      showMyApply = approval.showMyApplication,
      showMgmtApply = approval.showManageApplication;

    if (pathList.length <= 1) {
      if(enableApply) {
        pathList[1] = configs.default_module;
      } else {
        pathList[1] = 'apply-approval';
      }
    } else {
      if(!enableApply) {
        //admin user won't see dashboard regular modules in approval
        ['compute', 'network', 'storage'].forEach(title => {
          var modules = configs.modules;
          modules.some(obj => {
            if(obj.title === title) {
              obj.items.forEach(tab => {
                if(pathList[1] === tab) {
                  pathList[1] = 'apply-approval';
                }
              });
              return true;
            }
            return false;
          });
        });

        //admin user won't see instanc-create module in approval
        if(pathList[1] === 'overview' || 'instanc-create') {
          pathList[1] = 'apply-approval';
        }
      }

      if(!showMyApply && pathList[1] === 'apply') {
        if(enableApply) {
          pathList[1] = configs.default_module;
        } else {
          pathList[1] = 'apply-approval';
        }
      }

      if(!showMgmtApply) {
        ['apply-approval', 'approved'].forEach(tab => {
          if(pathList[1] === tab) {
            pathList[1] = configs.default_module;
          }
        });
      }
    }
    router.replaceState('/approval/' + pathList.slice(1).join('/'), null, null, true);
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
    console.time('approval');
  }

  componentDidUpdate() {
    console.timeEnd('approval');
  }

  onClickSubmenu(e, m) {
    router.pushState('/approval/' + m.key);
  }

  getIcon(name) {
    switch(name) {
      case 'loadbalancer':
        return 'lb';
      case 'instance-create':
        return 'deploy';
      case 'apply':
        return 'collaboration';
      case 'apply-approval':
        return 'applications';
      default:
        return name;
    }
  }

  render() {
    var state = this.state,
      props = this.props,
      __ = props.__,
      HALO = props.HALO,
      modules = loader.modules,
      menus = [];
    var approval = HALO.configs.approval,
      enableApply = approval.showApply,
      showMyApply = approval.showMyApplication,
      showMgmtApply = approval.showManageApplication;

    props.menus.forEach((m) => {
      if(!enableApply) {
        switch(m.title) {
          case 'compute':
          case 'network':
          case 'storage':
            return;
          default:
            break;
        }
      }

      var submenu = [];
      m.items.forEach((n) => {
        switch(n) {
          case 'overview':
            if(!enableApply) { return; }
            break;
          case 'instance-create':
            if(!enableApply) { return; }
            break;
          case 'apply':
            if(!showMyApply) { return; }
            break;
          case 'apply-approval':
          case 'approved':
            if(!showMgmtApply) { return; }
            break;
          default:
            break;
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
        key: m.title || 'instance',
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
                  return (<M
                    key={index}
                    style={state.selectedModule === m ? {display: 'flex'} : {display: 'none'}}
                    params={state.params} />);
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
