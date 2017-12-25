require('./style/index.less');

const React = require('react');

class DropdownList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      expand: false
    };
  }

  onClickHolder() {
    this.setState({
      expand: !this.state.expand
    });
  }

  onClickItem(item, index, evt) {
    this.props.onClickItem ? this.props.onClickItem(item, index, evt) : null;
    this.setState({
      expand: false
    });
  }

  render() {
    const props = this.props;
    const state = this.state;
    const selectedIndex = isNaN(Number(props.selectedIndex)) ? 0 : Number(props.selectedIndex);

    return (
      <div className="halo-admin-comp-dropdown-list">
        <div className="holder-row" onClick={this.onClickHolder.bind(this)}>
          { props.required ? <i className="required-field">*</i> : null }
          <span>{ props.items[selectedIndex].title }</span>
          <i className={'glyphicon icon-arrow-' + (state.expand ? 'down' : 'right')}></i>
        </div>
        <ul className={'dropdown-list' + (state.expand ? ' show' : ' hide')}>
          { props.items.map((item, index) => {
            const selected = selectedIndex === index ? true : false;
            return (
              <li className={selected ? 'selected' : ''} key={item.key} onClick={this.onClickItem.bind(this, item, index)}>
                <span>{item.title}</span>
                {selected ? <i className="glyphicon icon-correct"></i> : null}
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
}

module.exports = DropdownList;
