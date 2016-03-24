require('./style/index.less');

var React = require('react');
var Settings = require('./settings');
var Regions = require('./regions');

class NavBar extends React.Component {
  constructor(props) {
    super(props);
  }

  shouldComponentUpdate() {
    return false;
  }

  render() {
    var regionName = 'xxx';
    // var currentRegion = HALO.current_region;
    // HALO.region_list.map((region) => {
    //   regionName = region.id === currentRegion ? region.name : '';
    // });

    return (
      <div className="halo-com-navbar">
        <div className="logo"></div>
        <div className="region-wp">
          <div className="region-name">
            <i className="glyphicon icon-region"></i>
            <span ref="name">{regionName}</span>
            <div ref="settingBtn" className="settings-btn"></div>
          </div>
          <div className="region">
            <Regions />
          </div>
        </div>
        <div className="user-info">
          <i className="glyphicon icon-avatar"></i>
          <span className="user-name">{this.props.username}</span>
          <div ref="settingBtn" className="settings-btn"></div>
          <div className="settings">
            <Settings />
          </div>
        </div>
      </div>
    );
  }
}

module.exports = NavBar;
