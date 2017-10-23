require('./style/index.less');

const React = require('react');
const Menu = require('client/uskin/index').Menu;

class SideMenu extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let props = this.props,
      style;

    if(!props.items) {
      style = {
        width: '96px',
        minWidth: '96px',
        maxWidth: '96px'
      };
    }
    return (
      <div ref="halo_com_menu" className="halo-com-menu" style={style}>
        {
          props.items ?
            <div className="sub-menu">
              <Menu items={props.items} />
            </div>
          : null
        }
      </div>
    );
  }
}

module.exports = SideMenu;
