require('./style/index.less');

var React = require('react');
var {Button} = require('client/uskin/index');

class RelatedSnapshot extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
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

  createAcion(childItem) {
    var actionType = this.props.actionType.create;
    this.onAction(actionType, childItem);
  }

  deleteAcion(childItem) {
    var actionType = this.props.actionType.delete;
    this.onAction(actionType, childItem);
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

  getStatusIcon(item) {
    switch(item.status.toLowerCase()) {
      case 'active':
        return <i className="glyphicon icon-status-active active"/>;
      default:
        return null;
    }
  }

  render() {
    var btnConfig = this.props.btnConfig,
      items = this.props.items;

    return (
      <div className="toggle">
        <div className="toggle-title" onClick={this.toggle}>
          {this.props.title}
          <i className={'glyphicon icon-arrow-' + (this.state.toggle ? 'up' : 'down')} />
        </div>
        <div className={'toggle-content' + (this.state.toggle ? ' unfold' : ' fold')}>
          <div className="halo-com-related-snapshot">
            <Button value={btnConfig.value} onClick={this.onBtnAction.bind(this, btnConfig.actionType)}/>
            {items.length > 0 ?
              <div className="timeline">
                {items.map((item, i) =>
                  <div className="per-line" key={i}>
                    <div className="title">{item.title}</div>
                    <div className="time-spot-box">
                      <div className="time-spot" />
                      <div className="time-line" />
                    </div>
                    <div className="content">
                      <div className="name">{item.name}</div>
                      <div className="size">{item.size}</div>
                      <div className="time">{item.time}</div>
                      <div className="status">{item.status}</div>
                      <div className="icon-set">
                        <i className={'glyphicon icon-' + item.createIcon + ' create'} onClick={this.createAcion.bind(this, item.childItem)}/>
                        <i className="glyphicon icon-delete delete" onClick={this.deleteAcion.bind(this, item.childItem)}/>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            : <div className="no-related-data">
                {this.props.noItemAlert}
              </div>
            }
          </div>
        </div>
      </div>
    );
  }

}

module.exports = RelatedSnapshot;
