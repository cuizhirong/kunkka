var React = require('react');
var { Dropdown } = require('client/uskin/index');

class Modal extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      unfold: false
    };

    ['onToggle'].forEach((func) => {
      this[func] = this[func].bind(this);
    });
  }

  onToggle(e) {
    this.setState({
      unfold: !this.state.unfold
    });
  }

  renderItems(items) {
    let render = (element, index) => {
      return (
        <ul className="multi-dropdown-column">
          {
            element.map((ele, i) =>
              <li key={i}>
                {ele.title}
                {ele.items ? render(ele.items) : null}
              </li>
            )
          }
        </ul>
      );
    };

    return render(items);
  }

  render() {
    const props = this.props;
    const state = this.state;
    const items = props.items;

    return (
      <div className={'multi-dropdown' + (state.unfold ? ' active' : '')}>
        <div className={'multi-dropdown-title'} onClick={this.onToggle}>
          <div>{props.value}</div>
          <i className={'glyphicon icon-arrow-down' + (state.unfold ? ' rotate' : '')} />
        </div>
        <div className={'multi-dropdown-box' + (state.unfold ? '' : ' hide')}>
          <Dropdown items={items} onClick={props.onClick} />
        </div>
      </div>
    );
  }
}

module.exports = Modal;
