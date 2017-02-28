var React = require('react');

class Item extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      unfold: props.unfold
    };

    ['toggle'].forEach((func) => {
      this[func] = this[func].bind(this);
    });
  }

  toggle(e) {
    this.setState({
      unfold: !this.state.unfold
    });
  }

  onClick(item, e) {
    this.props.onClick(item, e);
  }

  isSelected(props, ele) {
    return (props.state.resource
      && props.state.resource.id === ele.resource.id
      && props.state.metricType === ele.metricType);
  }

  render() {
    const props = this.props;
    const item = props.item;

    let hasSelected = false;
    if (props.state.resource) {
      if (props.state.resourceType === 'instance_network_interface') {
        hasSelected = item.items.some((ele) =>
          ele.resourceType === 'instance_network_interface'
          && ele.resource.id === props.state.resource.id
        );
      } else {
        hasSelected = props.state.resource.id === item.id;
      }
    }
    const unfold = hasSelected || this.state.unfold;

    return (
      item ?
        <div className="select-table-item">
          <div className={'select-table-item-title' + (item && (props.state.resource === item.resource) || unfold ? ' selected' : '')} onClick={this.toggle}>
            <i className={'icon-type glyphicon icon-' + item.type} />
            <span>{item.title}</span>
            <i className={'icon-arrow glyphicon icon-arrow-' + (unfold ? 'up' : 'down')} />
          </div>
          <div className={'select-table-item-content' + (unfold ? '' : ' fold')}>
            <ul>
              {item.items.map((ele) =>
                <li key={ele.key}
                  className={this.isSelected(props, ele) ? 'selected' : ''}
                  onClick={this.onClick.bind(this, ele)}>
                  {ele.name}
                </li>
              )}
            </ul>
          </div>
        </div>
      : null
    );
  }
}

module.exports = Item;
