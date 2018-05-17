require('./style/index.less');

const React = require('react');
const Settings = require('./settings');
const Cluster = require('./cluster');
const Regions = require('./regions');
const Projects = require('./projects');

class NavBar extends React.Component {
  constructor(props) {
    super(props);
  }

  shouldComponentUpdate() {
    return false;
  }

  onSwitch(k) {
    if (k === HALO.application.current_application) {
      return false;
    } else {
      window.location = '/' + k;
    }
  }

  render() {
    let HALO = this.props.HALO;
    let { region, project, setting } = this.props;

    let currentProjectId = HALO.user.projectId,
      currentProjectName;
    HALO.user.projects.some((p) => {
      if (p.id === currentProjectId) {
        currentProjectName = p.name;
        return true;
      }
      return false;
    });

    let currentRegionId = HALO.current_region,
      currentRegionName;
    HALO.region_list.some((r) => {
      if (r.id === currentRegionId) {
        currentRegionName = r.name;
        return true;
      }
      return false;
    });

    let clusterLength = HALO.kunkka_remotes.length,
      showCluster = false;

    if (clusterLength > 1) showCluster = HALO.kunkka_remotes[0].url !== HALO.kunkka_remotes[1].url;

    let logo = {
      backgroundImage: 'url(' + (HALO.settings.logo_url || '/static/assets/nav_logo.png') + ')'
    };

    return (
      <div className="halo-com-navbar">
        <div className="logo" style={logo}></div>
        <ul className="left">
          {
            region && ((clusterLength <= 1) || !showCluster) ?
              <li>
                <div className="link-title">
                  <i className="glyphicon icon-region"></i>
                  <span ref="name">{currentRegionName}</span>
                </div>
                {
                  HALO.region_list.length > 1 ? <div className="link-dropdown">
                    <Regions />
                  </div> : null
                }
              </li> :
              null
          }
          {
            project ?
              <li>
                <div className="link-title">
                  <i className="glyphicon icon-project"></i>
                  <span ref="name">{currentProjectName}</span>
                </div>
                {
                  HALO.user.projects.length > 1 ? <div className="link-dropdown">
                    <Projects />
                  </div> : null
                }
              </li> :
              null
          }
          {
            showCluster ?
              <li>
                <div className="link-title">
                  <i className="glyphicon icon-topology"></i>
                  <span ref="name">{currentRegionName}</span>
                </div>
                {
                  clusterLength > 1 ? <div className="link-dropdown">
                    <Cluster />
                  </div> : null
                }
              </li> :
              null
          }
        </ul>
        <ul className="right">
          {
            HALO.application.application_list.map((m) => {
              let k = Object.keys(m)[0];
              let currentApp = HALO.application.current_application;
              return (
                <li key={k} onClick={this.onSwitch.bind(this, k)} className={currentApp === k ? 'small selected' : 'small'}>
                  <div className="link-title">
                    <i className={'glyphicon icon-g-' + k}></i>
                    <span className="user-name">{m[k]}</span>
                  </div>
                </li>
              );
            })
          }
          {
            setting ?
              <li className="big">
                <div className="link-title">
                  <i className="glyphicon icon-avatar"></i>
                  <span className="user-name">{HALO.user.username}</span>
                </div>
                <div className="link-dropdown">
                  <Settings __={this.props.__} />
                </div>
              </li> :
              null
          }
        </ul>
      </div>
    );
  }
}

module.exports = NavBar;
