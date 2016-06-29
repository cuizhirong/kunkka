require('./style/index.less');

var React = require('react');
var {Button, DropdownButton} = require('client/uskin/index');
var __ = require('locale/client/dashboard.lang.json');
// var getStatusIcon = require('../../utils/status_icon');

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

  onAction(actionType, childItem, e, btn) {
    var props = this.props,
      tabKey = props.tabKey;

    var data = {};
    data.rawItem = props.rawItem;
    if (childItem) {
      data.childItem = childItem;
    }

    if(actionType.slice(0, 4) === 'more') {
      this.props.onAction && this.props.onAction(tabKey, actionType, data, btn.key);
    } else {
      this.props.onAction && this.props.onAction(tabKey, actionType, data);
    }
  }

  wordsToLine(data) {
    var value = '';
    data.forEach(ele => {
      value += __[ele];
    });

    return value;
  }

  render() {
    var listenerConfigs = this.props.listenerConfigs,
      btnValue = this.wordsToLine(['modify', 'listener']),
      btnData = {value: __.more};

    return (
      <div className="toggle">
        <div className="toggle-title" onClick={this.toggle}>
          {this.props.title}
          <i className={'glyphicon icon-arrow-' + (this.state.toggle ? 'up' : 'down')} />
        </div>
        <div className={'toggle-content' + (this.state.toggle ? ' unfold' : ' fold')}>
          <div className="halo-listener-list">
            <div className="listener-table-content">
              <Button type="create" value={__.create + __.listener} onClick={this.onAction.bind(this, 'create_listener')}/>
              <div className="listeners-list">
                {listenerConfigs.map((config, i) =>
                  <div className="listener-detail" key={i}>
                    <div className="listener-detail-head">
                      <div className="listener-name">{__.listener} : <span>{config.listener.name}</span></div>
                      <div className="listener-btn">
                        <Button value={btnValue} onClick={this.onAction.bind(this, 'modify_listener', config.listener)} />
                        <DropdownButton buttonData={btnData} dropdownItems={config.listenerDropdown} dropdownOnClick={this.onAction.bind(this, 'more_listener_ops', config.listener)}/>
                      </div>
                      <div className="clearfix"></div>
                    </div>
                    <div className="listener-detail-body">
                      {config.listenerDetail.map((ele, j) =>
                        <div className="detail-item" key={j}>{ele.feild} : {ele.value}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

module.exports = ListenerList;
