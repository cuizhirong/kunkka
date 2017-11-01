require('./style/index.less');

const React = require('react');
const { Tab, Switch } = require('client/uskin/index');

const __ = require('locale/client/admin.lang.json');
const request = require('./request');
let ID;

class Model extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      loading: true
    };

    ['switchApp', 'onInitialize'].forEach(a => {
      this[a] = this[a].bind(this);
    });
  }

  componentWillMount() {
    this.onInitialize();
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.style.display === 'none' && this.props.style.display === 'none') {
      return false;
    }
    return true;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.style.display !== 'none' && this.props.style.display === 'none') {
      this.onInitialize();
    }
  }

  onInitialize() {
    request.getList().then(res => {
      const config = res.setting.find(s => s.name === 'module_config');
      const moduleConfig = JSON.parse(config.value);
      ID = config.id;
      const appItems = Object.keys(moduleConfig).map((m, i) => {
        return {
          name: __[m],
          key: `${i}`,
          default: i === 0
        };
      });
      this.setState({
        loading: false,
        appItems: appItems,
        modules: moduleConfig,
        module: moduleConfig[Object.keys(moduleConfig)[0]],
        currentApp: Object.keys(moduleConfig)[0]
      });
    });
  }

  //refresh: according to the given data rules
  refresh(data, params) {
  }

  switchApp(e, status) {
    const state = this.state;
    this.setState({
      appItems: state.appItems.map((a, i) => {
        return {
          name: a.name,
          key: `${i}`,
          default: a.key === status.key
        };
      }),
      module: state.modules[Object.keys(state.modules)[status.key]],
      currentApp: Object.keys(state.modules)[status.key]
    });
  }

  onSwitch(item) {
    const state = this.state;
    let module = state.module;
    let modules = state.modules;
    module[item].show = !module[item].show;
    modules[state.currentApp] = module;
    const newData = {
      value: JSON.stringify(modules)
    };
    request.editConfig(ID, newData).then((res) => {
      this.setState({
        module: module,
        modules: modules
      });
    });
  }

  renderItems() {
    const state = this.state;
    return <div className="items-wrapper">
      {
        Object.keys(state.module).map((m, i) => {
          return <div className="outer" key={i}>
            <div className="item">
              <div className="text">{state.module[m].lang} | {m}</div>
              <Switch
                onChange={this.onSwitch.bind(this, m)}
                labelOn={__.labelOn}
                labelOff={__.labelOff}
                disabled={m === 'setting-mgmt' || m === 'module-mgmt'}
                checked={state.module[m].show} />
            </div>
          </div>;
        })
      }
    </div>;
  }

  render() {
    const state = this.state;
    const items = [{
      name: __['module-mgmt'],
      key: '0',
      default: true
    }];
    return (
      state.loading ? <div className="loading-wrapper">

      </div> : <div className="halo-module-module-mgmt" style={this.props.style}>
        <div className="up">
          <Tab items={items} />
        </div>
        <div className="down">
          <Tab items={state.appItems} type="sm" onClick={this.switchApp} />
          <div className="content">
            <ul className="app-wrapper">
              {this.renderItems()}
            </ul>
          </div>
        </div>
      </div>
    );
  }

}

module.exports = Model;
