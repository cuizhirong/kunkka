require('./style/index.less');

var React = require('react');
var Menu = require('client/uskin/index').Menu;

class SideMenu extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    var props = this.props;

    return (
      <div className="halo-com-menu">
        <ul className="top-menu">
          <li>
            <i className="glyphicon icon-monitor"></i>
            <span>Project</span>
          </li>
        </ul>
        <Menu items={props.items} />
      </div>
    );
  }
}

module.exports = SideMenu;
