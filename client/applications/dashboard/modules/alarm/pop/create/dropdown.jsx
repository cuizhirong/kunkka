var React = require('react');
var Scrollbox = require('./scrollbox');

class Modal extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      unfold: false
    };

    ['onToggle', 'onClick'].forEach((func) => {
      this[func] = this[func].bind(this);
    });
  }

  onToggle(e) {
    if (!this.props.disabled) {
      this.setState({
        unfold: !this.state.unfold
      });
    }
  }

  onClick (item, e) {
    let func = this.props.onClick;
    func && func(item, e);
  }

  render() {
    const props = this.props;
    const state = this.state;
    const items = props.items;

    let boxCls = 'multi-dropdown';
    if (props.disabled) {
      boxCls += ' disabled';
    } else if (state.unfold) {
      boxCls += ' active';
    }

    return (
      <div className={boxCls}>
        <div className={'multi-dropdown-title'} onClick={this.onToggle}>
          <div>{props.value}</div>
          <i className={'glyphicon icon-arrow-down' + (state.unfold ? ' rotate' : '')} />
        </div>
        <div className={'multi-dropdown-box' + (state.unfold ? '' : ' hide')}>
          <Scrollbox items={items} onClick={this.onClick} />
        </div>
      </div>
    );
  }
}

module.exports = Modal;
