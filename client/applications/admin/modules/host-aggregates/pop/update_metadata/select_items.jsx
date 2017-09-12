const React = require('react');

class Item extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      unfold: false
    };
  }

  toggle(item) {
    this.setState({
      unfold: !this.state.unfold
    });
    this.changeDescription(item);
  }

  changeDescription(item) {
    this.props.onChangeDescription && this.props.onChangeDescription(item);
  }

  onAdd(item) {
    this.props.onAdd && this.props.onAdd(item, true);
  }

  render() {
    const props = this.props;
    const item = props.item;
    const __ = props.__;
    const unfold = this.state.unfold;

    return (
      item ?
        <li className="item-wrapper">
          <div className="subs-heading" onClick={this.toggle.bind(this, item)}>
            <span>{item.display_name}</span>
            <i className={'glyphicon icon-arrow-' + (unfold ? 'up' : 'down')} />
          </div>
          <ul className={'subs' + (unfold ? '' : ' fold')}>
            {
              Object.keys(item.properties).map((p) => {
                return <li key={item.properties[p].title} className="sub" onClick={this.changeDescription.bind(this, item.properties[p])}>
                  <span>{item.properties[p].title}</span>
                  {
                    item.properties[p].select ? <span className="added">{__.added}</span> : <i className="glyphicon icon-create" onClick={this.onAdd.bind(this, item.properties[p])}></i>
                  }
                </li>;
              })
            }
          </ul>
        </li>
      : null
    );
  }
}

module.exports = Item;
