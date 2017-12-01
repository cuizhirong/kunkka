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
const price = require('client/utils/price');
const priceConverter = require('./utils/price');

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
    let approval = HALO.configs.approval,
      enableApply = approval.showApply,
      showMyApply = approval.showMyApplication,
      showMgmtApply = approval.showManageApplication;
      // showAlarm = HALO.settings.enable_alarm;

    if (pathList.length <= 1) {
      if(enableApply) {
        pathList[1] = configs.default_module;
      } else {
        pathList[1] = 'apply-approval';
      }
    } else {
      if(!enableApply) {
        //admin user won't see dashboard regular modules in approval
        ['compute', 'network', 'storage', 'monitor'].forEach(title => {
          let modules = configs.modules;
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

        //admin user won't see instance-create module in approval
        if(pathList[1] === 'overview' || pathList[1] === 'instance-create') {
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

      // if (!showAlarm) {
      //   if(enableApply) {
      //     pathList[1] = configs.default_module;
      //   } else {
      //     pathList[1] = 'apply-approval';
      //   }
      // }
    }
    router.replaceState('/approval/' + pathList.slice(1).join('/'), null, null, true);
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
      router.replaceState('/approval/' + configs.default_module);
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
    if(HALO.settings.enable_charge && !HALO.prices) {
      price.getList().then((res) => {
        HALO.prices = priceConverter(res);
      });
    }
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
      case 'instance-snapshot':
        return 'snapshot';
      case 'alarm':
        return 'monitor';
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
    let approval = HALO.configs.approval,
      enableApply = approval.showApply,
      showMyApply = approval.showMyApplication,
      showMgmtApply = approval.showManageApplication,
      showAlarm = HALO.settings.enable_alarm;

    configs.modules.forEach((m) => {
      if(!enableApply) {
        switch(m.title) {
          case 'compute':
          case 'network':
          case 'storage':
          case 'monitor':
            return;
          default:
            break;
        }
      }

      let submenu = [];
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
          case 'alarm':
          case 'notification':
            if (!showAlarm) { return; }
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

      if(submenu.length > 0) {
        menus.push({
          title: __[m.title],
          key: m.title || 'overview',
          submenu: submenu
        });
      }
    });

    return (
      <div id="wrapper">
        <div id="navbar">
          <NavBar HALO={HALO} __={__} region={true} project={true} setting={true} />
        </div>
        <div id="main-wrapper">
          <SideMenu items={menus} application={HALO.application} />
          <div id="main">
            <div className="inner">
              {
                state.modules.map((m, index) => {
                  let M = modules[m];
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
      </div>
    );
  }

}

module.exports = Model;
