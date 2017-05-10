require('./style/index.less');

var React = require('react');
var Settings = require('./settings');
var Regions = require('./regions');
var Projects = require('./projects');

class NavBar extends React.Component {
  constructor(props) {
    super(props);
  }

  shouldComponentUpdate() {
    return false;
  }

  render() {
    var HALO = this.props.HALO;
    var { hideRegion, hideProject, hideSetting } = this.props;

    var currentProjectId = HALO.user.projectId,
      currentProjectName;
    HALO.user.projects.some((p) => {
      if (p.id === currentProjectId) {
        currentProjectName = p.name;
        return true;
      }
      return false;
    });

    var currentRegionId = HALO.current_region,
      currentRegionName;
    HALO.region_list.some((r) => {
      if (r.id === currentRegionId) {
        currentRegionName = r.name;
        return true;
      }
      return false;
    });

    var logo = {
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
