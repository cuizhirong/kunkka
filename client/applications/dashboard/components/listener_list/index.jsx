require('./style/index.less');

var React = require('react');
var {Button} = require('client/uskin/index');

class ListenerList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      toggle: false
    };

    this.toggle = this.toggle.bind(this);
  }

  componentWillMount() {
    this.setState({
      toggle: this.props.defaultUnfold
    });
  }

  toggle(e) {
    this.setState({
      toggle: !this.state.toggle
    });
  }

  onBtnAction(actionType) {
    this.onAction(actionType);
  }

  onAction(actionType, childItem) {
    var props = this.props,
      tabKey = props.tabKey;

    var data = {};
    data.rawItem = props.rawItem;
    if (childItem) {
      data.childItem = childItem;
    }

    this.props.onAction && this.props.onAction(tabKey, actionType, data);
  }


  render() {
    var btnConfig = this.props.btnConfig;

    return (
      <div className="toggle">
        <div className="toggle-title" onClick={this.toggle}>
          {this.props.title}
          <i className={'glyphicon icon-arrow-' + (this.state.toggle ? 'up' : 'down')} />
        </div>
        <div className={'toggle-content' + (this.state.toggle ? ' unfold' : ' fold')}>
          <div className="halo-com-listener-list">
            <div className="listener-table-list">
              <Button type={btnConfig.type} value={btnConfig.value} disabled={btnConfig.disabled} onClick={this.onBtnAction.bind(this, btnConfig.actionType)}/>
              <div>All listeners list here in seperate table.</div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

module.exports = ListenerList;
