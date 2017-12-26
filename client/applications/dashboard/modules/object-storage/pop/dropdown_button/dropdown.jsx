const React = require('react');

class Dropdown extends React.Component {

  constructor(props) {
    super(props);

    ['onClick'].forEach((func) => {
      this[func] = this[func].bind(this);
    });
  }

  onClick(item, e) {
    e.stopPropagation();

    this.props.onClick(item);
  }

  render() {
    const props = this.props;
    const items = props.items;
    const style = props.style;

    let createLists = (element, index) => (
      <ul key={index} ref="dropdown">
        {
          element.items.map((ele, i) =>
            <li className="dropdown-list"
              key={i}
              onClick={this.onClick.bind(this, ele)}
            >
              <a>{ele.title}</a>
            </li>
          )
        }
      </ul>
    );

    return (
      <div className="defined-dropdown" style={style} ref="container">
        {items.map((element, index) => createLists(element, index))}
      </div>
    );
  }

}

Dropdown.defaultProps = {
  items: []
};

module.exports = Dropdown;
