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
        <div className="region-wp">
          <div className="region-name">
            <div className="name-label">
              <i className="glyphicon icon-region"></i>
              <span ref="name">{currentRegionName}</span>
            </div>
            <div ref="settingBtn" className="settings-btn"></div>
          </div>
          <div className="region">
            <Regions />
          </div>
        </div>
        <div className="project-wp">
          <div className="region-name">
            <div className="name-label">
              <i className="glyphicon icon-project"></i>
              <span ref="name">{currentProjectName}</span>
            </div>
            <div ref="settingBtn" className="settings-btn"></div>
          </div>
          <div className="region">
            <Projects />
          </div>
        </div>
        <div className="user-info">
          <i className="glyphicon icon-avatar"></i>
          <span className="user-name">{HALO.user.username}</span>
          <div ref="settingBtn" className="settings-btn"></div>
          <div className="settings">
            <Settings __={this.props.__} />
          </div>
        </div>
      </div>
    );
  }
}

module.exports = NavBar;
