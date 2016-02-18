require('./style/index.less');

var React = require('react');
var __ = require('i18n/client/lang.json');

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

  getStatusIcon(item) {
    switch(item.status.toLowerCase()) {
      case 'active':
        return <i className="glyphicon icon-status-active active"/>;
      default:
        return null;
    }
  }

  render() {
    var items = this.props.items;

    return (
      <div className="toggle">
        <div className="toggle-title" onClick={this.toggle}>
          {this.props.title}
          <i className={'glyphicon icon-arrow-' + (this.state.toggle ? 'down' : 'up')} />
        </div>
        <div className={'toggle-content' + (this.state.toggle ? ' unfold' : ' fold')}>
          <div className="halo-com-related-snapshot">
            {this.props.children}
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
                      <div className="status">
                        {this.getStatusIcon(item)}
                        {__[item.status.toLowerCase()]}
                      </div>
                      <div className="icon-set">
                        <i className={'glyphicon icon-' + item.createIcon + ' create'}/>
                        <i className="glyphicon icon-delete delete"/>
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
