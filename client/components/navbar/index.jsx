require('./style/index.less');

const React = require('react');
const Settings = require('./settings');
const Regions = require('./regions');
const Projects = require('./projects');

class NavBar extends React.Component {
  constructor(props) {
    super(props);
  }

  shouldComponentUpdate() {
    return false;
  }

  render() {
    let HALO = this.props.HALO;
    let { hideRegion, hideProject, hideSetting } = this.props;

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

    let logo = {
      backgroundImage: 'url(' + (HALO.settings.logo_url || '/static/assets/nav_logo.png') + ')'
    };

    return (
      <div className="halo-com-navbar">
        <div className="logo" style={logo}></div>
        <ul className="links">
          {
            hideRegion ?
              null
            : <li>
                <div className="link-title">
                  <i className="glyphicon icon-region"></i>
                  <span ref="name">{currentRegionName}</span>
                </div>
                <div className="link-dropdown">
                  <Regions />
                </div>
              </li>
          }
          {
            hideProject ?
              null
            : <li>
                <div className="link-title">
                  <i className="glyphicon icon-project"></i>
                  <span ref="name">{currentProjectName}</span>
                </div>
                <div className="link-dropdown">
                  <Projects />
                </div>
              </li>
          }
          {
            hideSetting ?
              null
            : <li>
                <div className="link-title">
                  <i className="glyphicon icon-avatar"></i>
                  <span className="user-name">{HALO.user.username}</span>
                </div>
                <div className="link-dropdown">
                  <Settings __={this.props.__} />
                </div>
              </li>
          }
        </ul>
      </div>
    );
  }
}

module.exports = NavBar;
