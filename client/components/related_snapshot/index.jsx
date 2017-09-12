require('./style/index.less');

const React = require('react');
const {Button} = require('client/uskin/index');
const getTime = require('client/utils/time_unification');

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
    let actionType = this.props.actionType.create;
    this.onAction(actionType, childItem);
  }

  deleteAcion(childItem) {
    let actionType = this.props.actionType.delete;
    this.onAction(actionType, childItem);
  }

  onAction(actionType, childItem) {
    let props = this.props,
      tabKey = props.tabKey;

    let data = {};
    data.rawItem = props.rawItem;
    if (childItem) {
      data.childItem = childItem;
    }

    this.props.onAction && this.props.onAction(tabKey, actionType, data);
  }

  render() {
    let btnConfig = this.props.btnConfig,
      items = this.props.items;

    return (
      <div className="toggle">
        <div className="toggle-title" onClick={this.toggle}>
          {this.props.title}
          <i className={'glyphicon icon-arrow-' + (this.state.toggle ? 'up' : 'down')} />
        </div>
        <div className={'toggle-content' + (this.state.toggle ? ' unfold' : ' fold')}>
          <div className="halo-com-related-snapshot">
            <Button type={btnConfig.type} value={btnConfig.value} disabled={btnConfig.disabled} onClick={this.onBtnAction.bind(this, btnConfig.actionType)}/>
            {items.length > 0 ?
              <div className="timeline">
                {items.map((item, i) =>
                  <div className="per-line" key={i}>
                    <div className="title">{getTime(item.title, true)}</div>
                    <div className="time-spot-box">
                      <div className="time-spot" />
                      <div className="time-line" />
                    </div>
                    <div className="content">
                      <div className="name">{item.name}</div>
                      <div className="size">{item.size}</div>
                      <div className="time">{getTime(item.time)}</div>
                      <div className="status">{item.status}</div>
                      {item.childItem.status === 'queued' ?
                        <div className="icon-set">-</div>
                      : <div className="icon-set">
                          <i className={'glyphicon icon-' + item.createIcon + ' create'} onClick={this.createAcion.bind(this, item.childItem)}/>
                          <i className="glyphicon icon-delete delete" onClick={this.deleteAcion.bind(this, item.childItem)}/>
                        </div>
                      }
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
