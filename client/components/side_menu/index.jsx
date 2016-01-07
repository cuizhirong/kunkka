require('./style/index.less');

var React = require('react');
var Menu = require('client/uskin/index').Menu;

class SideMenu extends React.Component {
  constructor(props) {
    super(props);
  }

  submenuOnClick(e) {
    //submenu clicked
  }

  render() {
    var items = [{
      title: 'Project',
      key: 'project',
      submenu: [{
        subtitle: 'Instance',
        key: '1',
        onClick: this.submenuOnClick,
        iconClass: 'glyphicon icon-instance'
      }, {
        subtitle: 'Volumes',
        key: '2',
        onClick: this.submenuOnClick,
        iconClass: 'glyphicon icon-volume'
      }]
    }];

    return (
      <div className="halo-menu">
        <ul className="topmenu">
          <li>
            <i className="glyphicon icon-monitor"></i>
            <span>Project</span>
          </li>
        </ul>
        <Menu items={items}/>
      </div>
    );
  }
}

module.exports = SideMenu;
